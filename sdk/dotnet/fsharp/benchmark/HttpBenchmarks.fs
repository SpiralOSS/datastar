module StarFederation.Datastar.FSharp.Benchmark.HttpBenchmarks

open System
open System.Buffers
open System.IO
open System.IO.Pipelines
open System.Threading
open System.Threading.Tasks
open BenchmarkDotNet.Attributes
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Primitives
open StarFederation.Datastar.FSharp
open StarFederation.Datastar.FSharp.Benchmark.TestData

/// Mock PipeWriter that captures written data for benchmarking
type MockPipeWriter() =
    inherit PipeWriter()
    let _buffer = ArrayBufferWriter<byte>()

    override _.GetMemory(sizeHint) = _buffer.GetMemory(sizeHint)
    override _.GetSpan(sizeHint) = _buffer.GetSpan(sizeHint) 
    override _.Advance(count) = _buffer.Advance(count)
    override _.FlushAsync(cancellationToken) = ValueTask.FromResult(FlushResult())
    override _.Complete(exn) = ()
    override _.CompleteAsync(exn) = ValueTask.CompletedTask
    override _.CancelPendingFlush() = ()
    override _.OnReaderCompleted(callback, state) = ()

    member _.GetWrittenBytes() = _buffer.WrittenMemory.ToArray()
    member _.GetWrittenLength() = _buffer.WrittenCount

/// Mock HttpResponse that captures written data for benchmarking  
type MockHttpResponse() =
    inherit HttpResponse()
    let _bodyWriter = MockPipeWriter()
    let _headers = HeaderDictionary() :> IHeaderDictionary

    override _.StatusCode with get() = 200 and set(_) = ()
    override _.Headers = _headers
    override _.Body with get() = Stream.Null and set(_) = ()
    override _.BodyWriter = _bodyWriter :> PipeWriter
    override _.HasStarted = false
    override _.HttpContext = null
    override _.ContentLength with get() = Nullable<int64>() and set(_) = ()
    override _.ContentType with get() = null and set(_) = ()
    override _.Cookies = null
    override _.OnStarting(callback, state) = ()
    override _.OnCompleted(callback, state) = ()
    override _.Redirect(location, permanent) = ()
    override _.StartAsync(cancellationToken) = Task.CompletedTask

    member _.GetWrittenBytes() = _bodyWriter.GetWrittenBytes()
    member _.GetWrittenLength() = _bodyWriter.GetWrittenLength()

[<MemoryDiagnoser>]
[<SimpleJob>]
type HttpBenchmarks() =

    // Use consistent test events with realistic data like other benchmarks
    let smallEvent = ServerSentEvents.createPatchElementsEvent Sizes.Small ValueNone
    let mediumEvent = ServerSentEvents.createPatchElementsEvent Sizes.Medium (ValueSome "medium-sse-event")
    let largeEvent = ServerSentEvents.createPatchElementsEvent Sizes.Large (ValueSome "large-sse-event")

    [<Benchmark(Baseline = true)>]
    member _.HttpHandler_SendServerEvent_Small() =
        let response = MockHttpResponse()

        // Test the actual HTTP handler method
        ServerSentEventHttpHandler.SendServerEvent(response, smallEvent, CancellationToken.None)
            .GetAwaiter().GetResult() |> ignore

        response.GetWrittenLength()

    [<Benchmark>]
    member _.HttpHandler_SendServerEvent_Medium() =
        let response = MockHttpResponse()

        // Test the actual HTTP handler method
        ServerSentEventHttpHandler.SendServerEvent(response, mediumEvent, CancellationToken.None)
            .GetAwaiter().GetResult() |> ignore

        response.GetWrittenLength()

    [<Benchmark>]
    member _.HttpHandler_SendServerEvent_Large() =
        let response = MockHttpResponse()

        ServerSentEventHttpHandler.SendServerEvent(response, largeEvent, CancellationToken.None)
            .GetAwaiter().GetResult() |> ignore

        response.GetWrittenLength()
