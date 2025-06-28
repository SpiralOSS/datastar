namespace StarFederation.Datastar.FSharp

open System
open System.Buffers
open System.Text
open System.Threading
open System.Threading.Tasks
open Microsoft.Extensions.Primitives
open StarFederation.Datastar.FSharp.Utility

[<AbstractClass; Sealed>]
type ServerSentEventGenerator =
    static member PatchElements(elements, options:PatchElementsOptions) =
        let dataLines =
            [|
                if (options.Selector |> ValueOption.isSome) then 
                    yield $"{Consts.DatastarDatalineSelector} {options.Selector |> ValueOption.get |> Selector.value}"

                if (options.PatchMode <> Consts.DefaultElementPatchMode) then 
                    yield $"{Consts.DatastarDatalineMode} {options.PatchMode |> Consts.ElementPatchMode.toString}"

                if (options.UseViewTransition <> Consts.DefaultElementsUseViewTransitions) then 
                    yield $"{Consts.DatastarDatalineUseViewTransition} %A{options.UseViewTransition}"

                yield! String.buildDataLinesFromSegments Consts.DatastarDatalineElements elements
            |] |> StringValues

        { EventType = PatchElements
          Id = options.EventId
          Retry = options.Retry
          DataLines = dataLines }

    static member PatchElements elements = ServerSentEventGenerator.PatchElements (elements, PatchElementsOptions.defaults)

    static member RemoveElement(selector, options:RemoveElementOptions) =
        let dataLines =
            [|
                yield $"{Consts.DatastarDatalineSelector} {selector |> Selector.value}"
                yield $"{Consts.DatastarDatalineMode} {ElementPatchMode.Remove |> Consts.ElementPatchMode.toString}"

                if (options.UseViewTransition <> Consts.DefaultElementsUseViewTransitions) then 
                    yield $"{Consts.DatastarDatalineUseViewTransition} %A{options.UseViewTransition}"
            |] |> StringValues

        { EventType = PatchElements
          Id = options.EventId
          Retry = options.Retry
          DataLines = dataLines }

    static member RemoveElement selector = ServerSentEventGenerator.RemoveElement(selector, RemoveElementOptions.defaults)

    static member PatchSignals(signals, options:PatchSignalsOptions) =
        let dataLines =
            [|
                if (options.OnlyIfMissing <> Consts.DefaultPatchSignalsOnlyIfMissing) then 
                    yield $"{Consts.DatastarDatalineOnlyIfMissing} %A{options.OnlyIfMissing}"

                yield! String.buildDataLinesFromSegments Consts.DatastarDatalineSignals (signals |> Signals.value)
            |] |> StringValues

        { EventType = PatchSignals
          Id = options.EventId
          Retry = options.Retry
          DataLines = dataLines }

    static member PatchSignals signals = ServerSentEventGenerator.PatchSignals(signals, PatchSignalsOptions.defaults)

    static member ExecuteScript(script: string, options:ExecuteScriptOptions) =
        let script = if script.StartsWith("<script>", StringComparison.CurrentCultureIgnoreCase) then script else $"<script>{script}</script>"
        { EventType = PatchElements
          Id = options.EventId
          Retry = options.Retry
          DataLines = String.buildDataLinesFromSegments Consts.DatastarDatalineElements script }

    static member ExecuteScript script = ServerSentEventGenerator.ExecuteScript(script, ExecuteScriptOptions.defaults)
