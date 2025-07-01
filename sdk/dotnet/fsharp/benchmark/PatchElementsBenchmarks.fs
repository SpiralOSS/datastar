module StarFederation.Datastar.FSharp.Benchmark.PatchElementsBenchmarks

open System
open BenchmarkDotNet.Attributes
open BenchmarkDotNet.Configs
open BenchmarkDotNet.Diagnosers
open StarFederation.Datastar.FSharp
open StarFederation.Datastar.FSharp.Benchmark.TestData

[<MemoryDiagnoser>]
[<SimpleJob>]
type PatchElementsBenchmarks() =
    
    // Test data using realistic HTML with consistent scaling
    let smallElement = Html.generate Sizes.Small
    let mediumElement = Html.generate Sizes.Medium
    let largeElement = Html.generate Sizes.Large
    
    let defaultOptions = PatchElementsOptions.defaults
    let selectorOptions = { defaultOptions with Selector = ValueSome (Selector.create "#target") }
    let fullOptions = { selectorOptions with PatchMode = ElementPatchMode.Inner; UseViewTransition = true }
    
    [<Benchmark(Baseline = true)>]
    member _.PatchElements_Small_Default() =
        ServerSentEventGenerator.PatchElements(smallElement, defaultOptions)
    
    [<Benchmark>]
    member _.PatchElements_Small_WithSelector() =
        ServerSentEventGenerator.PatchElements(smallElement, selectorOptions)
    
    [<Benchmark>]
    member _.PatchElements_Small_FullOptions() =
        ServerSentEventGenerator.PatchElements(smallElement, fullOptions)
    
    [<Benchmark>]
    member _.PatchElements_Medium_Default() =
        ServerSentEventGenerator.PatchElements(mediumElement, defaultOptions)
    
    [<Benchmark>]
    member _.PatchElements_Medium_WithSelector() =
        ServerSentEventGenerator.PatchElements(mediumElement, selectorOptions)
    
    [<Benchmark>]
    member _.PatchElements_Large_Default() =
        ServerSentEventGenerator.PatchElements(largeElement, defaultOptions)
    
    [<Benchmark>]
    member _.PatchElements_Large_WithSelector() =
        ServerSentEventGenerator.PatchElements(largeElement, selectorOptions)
