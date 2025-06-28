# Datastar .NET SDK Zero-Allocation Optimization

## Overview

Add zero-allocation method overloads to the Datastar .NET SDK, focusing on F# core implementation first, then exposing through C# wrapper. Use BenchmarkDotNet to guide optimizations and measure improvements.

## Phase 1: F# Core Benchmarking Infrastructure

- [x] **1.1** Create F# benchmark project at `/fsharp/benchmark/`
- [x] **1.2** Add F# benchmark project to solution file
- [x] **1.3** Set up BenchmarkDotNet with basic configuration for F#
- [x] **1.4** Create baseline benchmarks for current F# core functions:
  - [x] `ServerSentEventGenerator.PatchElements`
  - [x] `ServerSentEventGenerator.PatchSignals`
  - [x] `ServerSentEventGenerator.ExecuteScript`
  - [x] `ServerSentEvent.serializeAsBytes`
- [x] **1.5** Run baseline F# benchmarks and document allocation patterns
- [x] **1.6** Identify top allocation hotspots from F# benchmark results

## Phase 2: F# Core Zero-Allocation Implementation (Priority Order)

### Priority 1: Serialization Optimization (Highest Impact) ✅ COMPLETED

- [x] **2.1** Implement zero-allocation `ServerSentEvent.serializeToBuffer`:
  - [x] ✅ **BREAKTHROUGH RESULTS**: 30-50x faster, 96-97% memory reduction
  - [x] Made method synchronous to eliminate async overhead (I/O flushing moved to caller)
  - [x] Implemented zero-allocation serialization using `IBufferWriter<byte>` with direct UTF-8 encoding
  - [x] Added span-based line-by-line writing without intermediate string allocations
  - [x] Eliminated string concatenation, sequence operations, and intermediate collections
  - [x] Updated HttpHandlers to use synchronous API with separate flush handling
  - [x] Added comprehensive benchmarks comparing `serializeToBuffer` vs `serializeAsBytes`

### Priority 2: Replace string-heavy implementations ✅ COMPLETED

- [x] **2.2** Create side-by-side span/byte-based implementations for string-heavy constants and utilities:
  - [x] Add span-based alternatives to `Utility.fs` functions (StringTokenizer-based splitting, pooled StringBuilder)
  - [x] Implement zero-allocation string line enumeration using StringTokenizer and StringSegment
  - [x] Add StringBuilder pooling to reduce allocations when constructing data lines
  - [x] Update ServerSentEventGenerator methods to use these helpers (PatchElements, PatchSignals, ExecuteScript)
  - [x] Replace string.Split and interpolations with zero-allocation span-based line enumeration
  - [x] Keep original string functions for backward compatibility, added new efficient versions alongside
  - [x] ✅ **Decision**: Remaining strings to be interned; focus shifted to byte-heavy implementations

### Priority 3: HTTP/SSE Integration Benchmarks

- [ ] **2.3** Add end-to-end HTTP benchmarks to validate optimizations:
  - [ ] Create `HttpBenchmarks.fs` with actual SSE streaming scenarios
  - [ ] Benchmark complete request/response cycle with `ServerSentEventHttpHandler`
  - [ ] Test memory allocation under real HTTP pressure
  - [ ] Compare `serializeAsBytes` vs `serializeToBuffer` in HTTP context
  - [ ] Measure throughput improvements for concurrent SSE connections

## Phase 3: C# Wrapper Integration & Benchmarking

- [ ] **3.1** Create C# benchmark project at `/csharp/benchmark/`
- [ ] **3.2** Add C# benchmark project to solution file
- [ ] **3.3** Add zero-allocation overloads to `IDatastarService` interface:
  - [ ] `PatchElementsAsync(ReadOnlySpan<char> fragments, ...)`
  - [ ] `PatchSignalsAsync(ReadOnlySpan<byte> serializedSignals, ...)`
  - [ ] `ExecuteScriptAsync(ReadOnlySpan<char> script, ...)`
- [ ] **3.4** Implement new overloads in `DatastarService` class
- [ ] **3.5** Create C# benchmarks for end-to-end API performance
- [ ] **3.6** Compare C# API performance: string vs span-based methods
- [ ] **3.7** Ensure backward compatibility with existing string-based APIs

## Baseline Results

- **Captured**: `fsharp/benchmark/baseline.txt` - Complete F# core benchmark results
- **Date**: 2025-06-28
- **Environment**: .NET 8.0.7, Apple M2 Pro, macOS Sequoia 15.5
- **Usage**: Reference for side-by-side comparisons with span-based implementations

## Current Status

- **Active Phase**: Phase 2.3
- **Completed**: ✅ Phase 2.1 & 2.2 - Zero-allocation serialization with 30-50x performance gains
- **Focus**: Only 2 real issues remain based on latest benchmarks:
  1. **PatchSignals OnlyIfMissing**: 44x slowdown (logic bug)
  2. **ExecuteScript Large**: 1.2MB allocation (needs buffer approach)

## Project Structure

```
/Users/ryan/Code/datastar/sdk/dotnet/
├── fsharp/
│   ├── src/           # F# core implementation
│   └── benchmark/     # F# core benchmarks
├── csharp/
│   ├── src/           # C# wrapper implementation
│   └── benchmark/     # C# API benchmarks (created in Phase 3)
└── TODO.md
```

## Notes

- Keep existing F# and C# APIs unchanged for backward compatibility
- Focus on F# core optimizations first since that's where allocations occur
- Separate benchmark projects keep F# core and C# API measurements distinct
- Use iterative approach with benchmarking to guide each optimization
- Test thoroughly to ensure functional equivalence between old and new APIs
- Retain StringBuilder where needed but use span-based overloads for efficiency
- Consider struct types over reference types where appropriate for stack allocation

## Allocation Hotspots Identified

Based on F# source analysis:

1. String interpolation in `ServerSentEventGenerator` (`$"..."` patterns)
2. String splitting operations (`String.split String.newLines`)
3. UTF-8 encoding in `ServerSentEvent.serializeAsBytes`
4. Sequence operations creating intermediate collections
5. StringBuilder usage in utility functions (optimize with span overloads)
