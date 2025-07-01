module StarFederation.Datastar.FSharp.Benchmark.ExecuteScriptBenchmarks

open System
open BenchmarkDotNet.Attributes
open StarFederation.Datastar.FSharp
open StarFederation.Datastar.FSharp.Benchmark.TestData

[<MemoryDiagnoser>]
[<SimpleJob>]
type ExecuteScriptBenchmarks() =

    // Use realistic JavaScript generation with consistent scaling  
    let smallScript = JavaScript.generate Sizes.Small
    let mediumScript = JavaScript.generate Sizes.Medium
    let largeScript = JavaScript.generate Sizes.Large
    
    // Script that already has <script> tags to test different code path
    let preWrappedScript = $"<script>{JavaScript.generate Sizes.Small}</script>"

    let defaultOptions = ExecuteScriptOptions.defaults
    let customOptions = { defaultOptions with EventId = ValueSome "custom-event" }

    [<Benchmark(Baseline = true)>]
    member _.ExecuteScript_Small_Default() =
        ServerSentEventGenerator.ExecuteScript(smallScript, defaultOptions)

    [<Benchmark>]
    member _.ExecuteScript_Small_CustomOptions() =
        ServerSentEventGenerator.ExecuteScript(smallScript, customOptions)

    [<Benchmark>]
    member _.ExecuteScript_Medium_Default() =
        ServerSentEventGenerator.ExecuteScript(mediumScript, defaultOptions)

    [<Benchmark>]
    member _.ExecuteScript_Large_Default() =
        ServerSentEventGenerator.ExecuteScript(largeScript, defaultOptions)

    [<Benchmark>]
    member _.ExecuteScript_PreWrapped_Default() =
        ServerSentEventGenerator.ExecuteScript(preWrappedScript, defaultOptions)
