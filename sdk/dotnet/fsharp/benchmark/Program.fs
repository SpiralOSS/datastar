open System
open BenchmarkDotNet.Running
open BenchmarkDotNet.Configs
open BenchmarkDotNet.Jobs
open BenchmarkDotNet.Environments
open BenchmarkDotNet.Diagnosers
open StarFederation.Datastar.FSharp.Benchmark.PatchElementsBenchmarks
open StarFederation.Datastar.FSharp.Benchmark.PatchSignalsBenchmarks
open StarFederation.Datastar.FSharp.Benchmark.ExecuteScriptBenchmarks
open StarFederation.Datastar.FSharp.Benchmark.SerializationBenchmarks
open StarFederation.Datastar.FSharp.Benchmark.HttpBenchmarks

[<EntryPoint>]
let main args =
    let config = 
        ManualConfig.Create(DefaultConfig.Instance)
            .AddJob(Job.Default.WithRuntime(CoreRuntime.Core80))
            .AddJob(Job.Default.WithRuntime(CoreRuntime.Core90))
            .AddDiagnoser(MemoryDiagnoser.Default)
    
    printfn "Datastar F# Core Benchmarks"
    printfn "Running baseline benchmarks for all F# core functions..."
    printfn ""
    
    // Run all baseline benchmarks
    printfn "Running PatchElements benchmarks..."
    let elementSummary = BenchmarkRunner.Run<PatchElementsBenchmarks>(config)
    
    printfn ""
    printfn "Running PatchSignals benchmarks..."
    let signalSummary = BenchmarkRunner.Run<PatchSignalsBenchmarks>(config)
    
    printfn ""
    printfn "Running ExecuteScript benchmarks..."
    let scriptSummary = BenchmarkRunner.Run<ExecuteScriptBenchmarks>(config)
    
    printfn ""
    printfn "Running Serialization benchmarks..."
    let serializationSummary = BenchmarkRunner.Run<SerializationBenchmarks>(config)
    
    printfn ""
    printfn "Running HTTP/SSE Integration benchmarks..."
    let httpSummary = BenchmarkRunner.Run<HttpBenchmarks>(config)
    
    printfn ""
    printfn "All baseline benchmarks completed!"
    printfn "Results show current allocation patterns for all F# core functions."
    
    0
