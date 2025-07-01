module StarFederation.Datastar.FSharp.Benchmark.PatchSignalsBenchmarks

open System
open System.Text.Json
open BenchmarkDotNet.Attributes
open StarFederation.Datastar.FSharp
open StarFederation.Datastar.FSharp.Benchmark.TestData

[<MemoryDiagnoser>]
[<SimpleJob>]
type PatchSignalsBenchmarks() =

    // Use consistent JSON generation for all sizes
    let smallSignal = Signals.generate Sizes.Small
    let mediumSignal = Signals.generate Sizes.Medium  
    let largeSignal = Signals.generate Sizes.Large

    let defaultOptions = PatchSignalsOptions.defaults
    let onlyIfMissingOptions = { defaultOptions with OnlyIfMissing = true }

    [<Benchmark(Baseline = true)>]
    member _.PatchSignals_Small_Default() =
        ServerSentEventGenerator.PatchSignals(smallSignal, defaultOptions)

    [<Benchmark>]
    member _.PatchSignals_Small_OnlyIfMissing() =
        ServerSentEventGenerator.PatchSignals(smallSignal, onlyIfMissingOptions)

    [<Benchmark>]
    member _.PatchSignals_Medium_Default() =
        ServerSentEventGenerator.PatchSignals(mediumSignal, defaultOptions)

    [<Benchmark>]
    member _.PatchSignals_Medium_OnlyIfMissing() =
        ServerSentEventGenerator.PatchSignals(mediumSignal, onlyIfMissingOptions)

    [<Benchmark>]
    member _.PatchSignals_Large_Default() =
        ServerSentEventGenerator.PatchSignals(largeSignal, defaultOptions)

    [<Benchmark>]
    member _.PatchSignals_Large_OnlyIfMissing() =
        ServerSentEventGenerator.PatchSignals(largeSignal, onlyIfMissingOptions)
