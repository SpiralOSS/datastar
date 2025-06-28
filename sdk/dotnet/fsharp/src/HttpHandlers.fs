namespace StarFederation.Datastar.FSharp

open System.Buffers
open System.Collections.Generic
open System.IO
open System.Text
open System.Text.Json
open System.Threading
open System.Threading.Channels
open System.Threading.Tasks
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Primitives
open Microsoft.Net.Http.Headers

module JsonSerializerOptions =
    /// JsonSerializerOptions but case insensitive
    let SignalsDefault =
        let options = JsonSerializerOptions()
        options.PropertyNameCaseInsensitive <- true
        options

/// Implementation of ISendServerEvent, for sending SSEs to the HttpResponse
[<Sealed>]
type ServerSentEventHttpHandler (httpResponse:HttpResponse) =
    let mutable _startResponseTask : Task = null
    let _startResponseLock = obj()
    let _sendEventChannel = Channel.CreateUnbounded<ServerSentEvent>()

    static member inline StartServerEventStream (httpResponse:HttpResponse, additionalHeaders:#seq<KeyValuePair<string, StringValues>>, cancellationToken:CancellationToken) =
        let task = backgroundTask {
            httpResponse.Headers.ContentType <- "text/event-stream"
            if (httpResponse.HttpContext.Request.Protocol = HttpProtocol.Http11) then
                httpResponse.Headers.Connection <- "keep-alive"
            for KeyValue(name, content) in additionalHeaders do
                match httpResponse.Headers.TryGetValue(name) with
                | true, existing ->
                    // httpResponse.Headers[name] <- StringValues.Concat(existing, content)
                    ()
                | false, _ ->
                    httpResponse.Headers.Add(name, content)
            do! httpResponse.StartAsync(cancellationToken)
            return! httpResponse.BodyWriter.FlushAsync(cancellationToken)
            }
        task :> Task

    static member inline StartServerEventStream (httpResponse, additionalHeaders) = ServerSentEventHttpHandler.StartServerEventStream(httpResponse, additionalHeaders, httpResponse.HttpContext.RequestAborted)

    static member inline StartServerEventStream (httpResponse:HttpResponse, cancellationToken:CancellationToken) = ServerSentEventHttpHandler.StartServerEventStream(httpResponse, Seq.empty, cancellationToken)

    static member inline StartServerEventStream (httpResponse:HttpResponse) = ServerSentEventHttpHandler.StartServerEventStream(httpResponse, Seq.empty, httpResponse.HttpContext.RequestAborted)

    static member inline SendServerEvent (httpResponse: HttpResponse, sse: ServerSentEvent, cancellationToken: CancellationToken) =
        ServerSentEvent.serializeToBuffer sse httpResponse.BodyWriter
        httpResponse.BodyWriter.FlushAsync(cancellationToken)

    static member inline SendServerEvent (sse, httpResponse) = ServerSentEventHttpHandler.SendServerEvent(httpResponse, sse, httpResponse.HttpContext.RequestAborted)

    interface ISendServerEvent with
        member this.StartServerEventStream (additionalHeaders, cancellationToken) =
            lock _startResponseLock (fun () -> if _startResponseTask = null then _startResponseTask <- ServerSentEventHttpHandler.StartServerEventStream(httpResponse, additionalHeaders, cancellationToken))
            _startResponseTask
        member this.StartServerEventStream(additionalHeaders) = (this:>ISendServerEvent).StartServerEventStream(additionalHeaders, httpResponse.HttpContext.RequestAborted)

        member this.StartServerEventStream(cancellationToken:CancellationToken) =
            lock _startResponseLock (fun () -> if _startResponseTask = null then _startResponseTask <- ServerSentEventHttpHandler.StartServerEventStream(httpResponse, cancellationToken))
            _startResponseTask
        member this.StartServerEventStream() = (this:>ISendServerEvent).StartServerEventStream(httpResponse.HttpContext.RequestAborted)

        member this.SendServerEvent(sse, cancellationToken) = task {
            do! _sendEventChannel.Writer.WriteAsync(sse, cancellationToken)
            do!
                if _startResponseTask <> null
                then _startResponseTask
                else (this :> ISendServerEvent).StartServerEventStream(cancellationToken)
            let! sse = _sendEventChannel.Reader.ReadAsync(cancellationToken)
            return! ServerSentEventHttpHandler.SendServerEvent(httpResponse, sse, cancellationToken)
            }
        member this.SendServerEvent(sse) = (this :> ISendServerEvent).SendServerEvent(sse, httpResponse.HttpContext.RequestAborted)

/// Implementation of IReadSignals, for reading the Signals from the HttpRequest
[<Sealed>]
type SignalsHttpHandler (httpRequest:HttpRequest) =

    static member inline GetSignalsStream (httpRequest:HttpRequest) =
        match httpRequest.Method with
        | System.Net.WebRequestMethods.Http.Get ->
            match httpRequest.Query.TryGetValue(Consts.DatastarKey) with
            | true, stringValues when stringValues.Count > 0 -> (new MemoryStream(Encoding.UTF8.GetBytes(stringValues[0])) :> Stream)
            | _ -> Stream.Null
        | _ -> httpRequest.Body

    static member inline ReadSignalsAsync (httpRequest:HttpRequest, cancellationToken:CancellationToken) = task {
        match httpRequest.Method with
        | System.Net.WebRequestMethods.Http.Get ->
            match httpRequest.Query.TryGetValue(Consts.DatastarKey) with
            | true, stringValues when stringValues.Count > 0 -> return (stringValues[0] |> Signals.create)
            | _ -> return Signals.empty
        | _ ->
            try
                use readResult = new StreamReader(httpRequest.Body)
                let! signals = readResult.ReadToEndAsync(cancellationToken)
                return (signals |> Signals.create)
            with _ -> return Signals.empty
        }

    static member inline ReadSignalsAsync (httpRequest:HttpRequest) = SignalsHttpHandler.ReadSignalsAsync(httpRequest, httpRequest.HttpContext.RequestAborted)

    static member inline ReadSignalsAsync<'T> (httpRequest:HttpRequest, jsonSerializerOptions:JsonSerializerOptions, cancellationToken:CancellationToken) = task {
        try
            match httpRequest.Method with
            | System.Net.WebRequestMethods.Http.Get ->
                match httpRequest.Query.TryGetValue(Consts.DatastarKey) with
                | true, stringValues when stringValues.Count > 0 ->
                    return ValueSome (JsonSerializer.Deserialize<'T>(stringValues[0], jsonSerializerOptions))
                | _ ->
                    return ValueNone
            | _ ->
                let! t = JsonSerializer.DeserializeAsync<'T>(httpRequest.Body, jsonSerializerOptions, cancellationToken)
                return (ValueSome t)
        with _ -> return ValueNone
        }

    static member inline ReadSignalsAsync<'T> (httpRequest:HttpRequest, cancellationToken:CancellationToken) = SignalsHttpHandler.ReadSignalsAsync<'T>(httpRequest, JsonSerializerOptions.SignalsDefault, cancellationToken)
    static member inline ReadSignalsAsync<'T> (httpRequest:HttpRequest, jsonSerializerOptions:JsonSerializerOptions) = SignalsHttpHandler.ReadSignalsAsync<'T>(httpRequest, jsonSerializerOptions, httpRequest.HttpContext.RequestAborted)
    static member inline ReadSignalsAsync<'T> (httpRequest:HttpRequest) = SignalsHttpHandler.ReadSignalsAsync<'T>(httpRequest, JsonSerializerOptions.SignalsDefault, httpRequest.HttpContext.RequestAborted)

    interface IReadSignals with
        member this.GetSignalsStream() = SignalsHttpHandler.GetSignalsStream(httpRequest)
        member this.ReadSignalsAsync(): Task<Signals> = SignalsHttpHandler.ReadSignalsAsync(httpRequest)
        member this.ReadSignalsAsync(cancellationToken: CancellationToken): Task<Signals> = SignalsHttpHandler.ReadSignalsAsync(httpRequest, cancellationToken)
        member this.ReadSignalsAsync<'T>(): Task<'T voption> = SignalsHttpHandler.ReadSignalsAsync<'T>(httpRequest)
        member this.ReadSignalsAsync<'T>(jsonSerializerOptions: JsonSerializerOptions): Task<'T voption> = SignalsHttpHandler.ReadSignalsAsync<'T>(httpRequest, jsonSerializerOptions)
        member this.ReadSignalsAsync<'T>(jsonSerializerOptions, cancellationToken) = SignalsHttpHandler.ReadSignalsAsync<'T>(httpRequest, jsonSerializerOptions, cancellationToken)
