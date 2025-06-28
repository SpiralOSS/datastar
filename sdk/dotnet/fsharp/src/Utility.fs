module internal StarFederation.Datastar.FSharp.Utility

open System
open System.Buffers
open System.Text
open Microsoft.Extensions.Primitives


module internal String =
    let newLines = [| "\r\n"; "\n"; "\r" |]
    let newLineChars = [| '\r'; '\n' |]

    // Original split method (keep for compatibility)
    let split (delimiters:string seq) (line:string) = 
        line.Split(delimiters |> Seq.toArray, StringSplitOptions.None)

    // New zero-allocation version using StringTokenizer
    let splitToSegments (separatorChars: char[]) (text: string) =
        let tokenizer = StringTokenizer(text, separatorChars)
        seq {
            for segment in tokenizer do
                if segment.Length > 0 then
                    yield segment
        }

    let splitLinesToSegments (text: string) = splitToSegments newLineChars text

    let buildDataLine (prefix: string) (segment: StringSegment) =
        String.Create(prefix.Length + segment.Length + 1, (prefix, segment), fun span (prefix, segment) ->
            let mutable pos = 0
            prefix.AsSpan().CopyTo(span.Slice(pos))
            pos <- pos + prefix.Length
            span.[pos] <- ' '
            pos <- pos + 1
            segment.AsSpan().CopyTo(span.Slice(pos))
        )

    let buildDataLinesFromSegments (prefix: string) (content: string) =
        let segments = splitLinesToSegments content
        [| for segment in segments -> buildDataLine prefix segment |]
        |> StringValues

    let inline isPopulated str = String.IsNullOrWhiteSpace str |> not

    let toKebab (pascalString:string) =
        let sb = StringBuilder(pascalString.Length * 2)
        let chars = pascalString.ToCharArray()
        for i = 0 to chars.Length - 1 do
            let chr = chars.[i]
            if Char.IsUpper(chr) && i > 0 then
                sb.Append('-').Append(Char.ToLower(chr)) |> ignore
            else
                sb.Append(Char.ToLower(chr)) |> ignore
        sb.ToString()
