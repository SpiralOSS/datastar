module StarFederation.Datastar.FSharp.Benchmark.SerializationBenchmarks

open System
open System.Buffers
open System.Threading
open BenchmarkDotNet.Attributes
open Microsoft.Extensions.Primitives
open StarFederation.Datastar.FSharp
open StarFederation.Datastar.FSharp.Benchmark.TestData

[<MemoryDiagnoser>]
[<SimpleJob>]
type SerializationBenchmarks() =

    // Use consistent event types and realistic data for proper comparison
    let smallEvent = ServerSentEvents.createPatchElementsEvent Sizes.Small ValueNone
    let mediumEvent = ServerSentEvents.createPatchElementsEvent Sizes.Medium (ValueSome "medium-event")
    let largeEvent = ServerSentEvents.createPatchElementsEvent Sizes.Large (ValueSome "large-event")

    [<Benchmark(Baseline = true)>]
    member _.SerializeAsBytes_Small() =
        ServerSentEvent.serializeAsBytes smallEvent |> Array.ofSeq

    [<Benchmark>]
    member _.SerializeAsBytes_Medium() =
        ServerSentEvent.serializeAsBytes mediumEvent |> Array.ofSeq

    [<Benchmark>]
    member _.SerializeAsBytes_Large() =
        ServerSentEvent.serializeAsBytes largeEvent |> Array.ofSeq

(*
    [<Benchmark>]
    member _.SerializeToBuffer_Small() =
        let buffer = ArrayBufferWriter<byte>()
        ServerSentEvent.serializeToBuffer smallEvent buffer
        buffer.WrittenMemory.ToArray()

    [<Benchmark>]
    member _.SerializeToBuffer_Medium() =
        let buffer = ArrayBufferWriter<byte>()
        ServerSentEvent.serializeToBuffer mediumEvent buffer
        buffer.WrittenMemory.ToArray()

    [<Benchmark>]
    member _.SerializeToBuffer_Large() =
        let buffer = ArrayBufferWriter<byte>()
        ServerSentEvent.serializeToBuffer largeEvent buffer
        buffer.WrittenMemory.ToArray()
*)
