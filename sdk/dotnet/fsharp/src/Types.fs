namespace StarFederation.Datastar.FSharp

open System
open System.Buffers
open System.Collections.Generic
open System.IO
open System.IO.Pipelines
open System.Text
open System.Text.Json
open System.Text.Json.Nodes
open System.Text.RegularExpressions
open System.Threading
open System.Threading.Tasks
open Microsoft.Extensions.Primitives
open StarFederation.Datastar.FSharp.Utility

[<Struct>]
type ServerSentEvent =
    { EventType: EventType
      Id: string voption
      Retry: TimeSpan
      DataLines: StringValues }

/// <summary>
/// Signals read to and from Datastar on the front end
/// </summary>
type Signals = string

/// <summary>
/// A dotted path into Signals to access a key/value pair
/// </summary>
type SignalPath = string

/// <summary>
/// An HTML selector name
/// </summary>
type Selector = string

[<Struct>]
type PatchElementsOptions =
    { Selector: Selector voption
      PatchMode: ElementPatchMode
      UseViewTransition: bool
      EventId: string voption
      Retry: TimeSpan }

[<Struct>]
type PatchSignalsOptions =
    { OnlyIfMissing: bool
      EventId: string voption
      Retry: TimeSpan }

[<Struct>]
type RemoveElementOptions =
    { UseViewTransition: bool
      EventId: string voption
      Retry: TimeSpan }

[<Struct>]
type ExecuteScriptOptions = { EventId: string voption; Retry: TimeSpan }

/// <summary>
/// Read the signals from the request
/// </summary>
type IReadSignals =
    abstract GetSignalsStream : unit -> Stream
    //
    abstract ReadSignalsAsync : unit -> Task<Signals>
    abstract ReadSignalsAsync : CancellationToken -> Task<Signals>
    abstract ReadSignalsAsync<'T> : unit -> Task<'T voption>
    abstract ReadSignalsAsync<'T> : JsonSerializerOptions -> Task<'T voption>
    abstract ReadSignalsAsync<'T> : JsonSerializerOptions * CancellationToken -> Task<'T voption>

/// <summary>
/// Can send SSEs to the client
/// </summary>
type ISendServerEvent =
    abstract StartServerEventStream : unit -> Task
    abstract StartServerEventStream : CancellationToken -> Task
    abstract StartServerEventStream : additionalHeaders:IDictionary<string, StringValues> -> Task
    abstract StartServerEventStream : additionalHeaders:IDictionary<string, StringValues> * CancellationToken -> Task
    abstract SendServerEvent : ServerSentEvent -> Task
    abstract SendServerEvent : ServerSentEvent * CancellationToken -> Task

module ServerSentEvent =
    let private lines sse =
        seq {
            $"event: {sse.EventType |> Consts.EventType.toString}"

            if sse.Id |> ValueOption.isSome
            then $"id: {sse.Id |> ValueOption.get}"

            if (sse.Retry <> Consts.DefaultSseRetryDuration)
            then $"retry: {sse.Retry.TotalMilliseconds}"

            yield! sse.DataLines |> Seq.map (fun dataLine -> $"data: {dataLine}")

            ""; ""; ""
        }

    let serializeAsBytes sse =
        lines sse
        |> Seq.map (fun line -> Seq.append (Encoding.UTF8.GetBytes line) "\n"B)
        |> Seq.concat

    let private eventPrefix = "event: "B
    let private idPrefix = "id: "B
    let private retryPrefix = "retry: "B
    let private dataPrefix = "data: "B

    let inline private writeUtf8String (str: string) (writer: IBufferWriter<byte>) =
        let span = writer.GetSpan(Encoding.UTF8.GetByteCount(str))
        let bytesWritten = Encoding.UTF8.GetBytes(str.AsSpan(), span)
        writer.Advance(bytesWritten)
        writer

    let inline private writeUtf8Literal (bytes: byte[]) (writer: IBufferWriter<byte>) =
        let span = writer.GetSpan(bytes.Length)
        bytes.AsSpan().CopyTo(span)
        writer.Advance(bytes.Length)
        writer

    let inline private writeNewline (writer: IBufferWriter<byte>) =
        let span = writer.GetSpan(1)
        span[0] <- 10uy // '\n'
        writer.Advance(1)

    let serializeToBuffer (sse: ServerSentEvent) (writer: IBufferWriter<byte>) =
        writer
        |> writeUtf8Literal eventPrefix
        |> writeUtf8String (sse.EventType |> Consts.EventType.toString)
        |> writeNewline
        |> ignore

        if sse.Id |> ValueOption.isSome then
            writer
            |> writeUtf8Literal idPrefix
            |> writeUtf8String (sse.Id |> ValueOption.get)
            |> writeNewline
            |> ignore

        if (sse.Retry <> Consts.DefaultSseRetryDuration) then
            writer
            |> writeUtf8Literal retryPrefix
            |> writeUtf8String (sse.Retry.TotalMilliseconds.ToString())
            |> writeNewline
            |> ignore

        for dataLine in sse.DataLines do
            writer
            |> writeUtf8Literal dataPrefix
            |> writeUtf8String dataLine
            |> writeNewline
            |> ignore

        writer |> writeNewline

module Signals =
    let inline value (signals:Signals) : string = signals.ToString()
    let create (signalsString:string) = Signals signalsString
    let tryCreate (signalsString:string) =
        try
            let _ = JsonObject.Parse(signalsString)
            ValueSome (Signals signalsString)
        with _ -> ValueNone
    let empty = Signals "{ }"

module SignalPath =
    let inline value (signalPath:SignalPath) = signalPath.ToString()
    let kebabValue signals = signals |> value |> String.toKebab
    let isValidKey (signalPathKey:string) =
        signalPathKey |> String.isPopulated && signalPathKey.ToCharArray() |> Seq.forall (fun chr -> Char.IsLetter chr || Char.IsNumber chr || chr = '_')
    let isValid (signalPathString:string) = signalPathString.Split('.') |> Array.forall isValidKey
    let tryCreate (signalPathString:string) =
        if isValid signalPathString
        then ValueSome (SignalPath signalPathString)
        else ValueNone
    let sp (signalPathString:string) =
        if isValid signalPathString
        then SignalPath signalPathString
        else failwith $"{signalPathString} is not a valid signal path"
    let create = sp
    let keys signalPath = signalPath |> value |> String.split ["."]
    let createJsonNodePathToValue<'T> signalPath (signalValue:'T) =
       signalPath
        |> keys
        |> Seq.rev
        |> Seq.fold (fun json key ->
            JsonObject([ KeyValuePair<string, JsonNode> (key, json) ]) :> JsonNode
            ) (JsonValue.Create(signalValue) :> JsonNode)

module Selector =
    let regex = Regex(@"[#.][-_]?[_a-zA-Z]+(?:\w|\\.)*|(?<=\s+|^)(?:\w+|\*)|\[[^\s""'=<>`]+?(?<![~|^$*])([~|^$*]?=(?:['""].*['""]|[^\s""'=<>`]+))?\]|:[\w-]+(?:\(.*\))?", RegexOptions.Compiled)
    let inline value (selector:Selector) = selector.ToString()
    let isValid (selectorString:string) = regex.IsMatch selectorString
    let tryCreate (selectorString:string) =
        if isValid selectorString
        then ValueSome (Selector selectorString)
        else ValueNone
    let sel (selectorString:string) =
        if isValid selectorString
        then Selector selectorString
        else failwith $"{selectorString} is not a valid selector"
    let create = sel

module PatchElementsOptions =
    let defaults =
        { Selector = ValueNone
          PatchMode = Consts.DefaultElementPatchMode
          UseViewTransition = Consts.DefaultElementsUseViewTransitions
          EventId = ValueNone
          Retry = Consts.DefaultSseRetryDuration }

module RemoveElementOptions =
    let defaults =
        { UseViewTransition = Consts.DefaultElementsUseViewTransitions
          EventId = ValueNone
          Retry = Consts.DefaultSseRetryDuration }

module PatchSignalsOptions =
    let defaults =
        { OnlyIfMissing = Consts.DefaultPatchSignalsOnlyIfMissing
          EventId = ValueNone
          Retry = Consts.DefaultSseRetryDuration }

module ExecuteScriptOptions =
    let defaults =
        { EventId = ValueNone
          Retry = Consts.DefaultSseRetryDuration }
