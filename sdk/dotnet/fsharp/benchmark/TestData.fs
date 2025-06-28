module StarFederation.Datastar.FSharp.Benchmark.TestData

open System
open System.Text.Json
open Microsoft.Extensions.Primitives
open StarFederation.Datastar.FSharp

/// Generate realistic HTML content with proper structure and varying complexity
module Html =
    let private components = [|
        "<div class=\"card\">"
        "<h2>Title {0}</h2>"
        "<p>This is paragraph {0} with some meaningful content about topic {1}.</p>"
        "<span class=\"meta\">Updated: {2}</span>"
        "</div>"
        
        "<article class=\"post\">"
        "<header><h3>Article {0}</h3></header>"
        "<main>Content for article {0} discussing {1} in detail.</main>"
        "<footer>Posted on {2}</footer>"
        "</article>"
        
        "<section class=\"widget\">"
        "<h4>Widget {0}</h4>"
        "<ul>"
        "<li>Item {0}-1: {1}</li>"
        "<li>Item {0}-2: {1}</li>"
        "</ul>"
        "</section>"
    |]
    
    let private topics = [| "technology"; "science"; "business"; "health"; "education"; "sports" |]
    let private dates = [| "2023-01-15"; "2023-06-20"; "2023-12-01"; "2024-03-10" |]
    
    let generate size =
        let rnd = Random(42) // Fixed seed for consistent results
        let sb = System.Text.StringBuilder()
        
        for i in 1..size do
            let htmlComponent = components.[rnd.Next(components.Length)]
            let topic = topics.[rnd.Next(topics.Length)]
            let date = dates.[rnd.Next(dates.Length)]
            let formatted = String.Format(htmlComponent, i, topic, date)
            sb.AppendLine(formatted) |> ignore
            
        sb.ToString()

/// Generate realistic JSON signals with proper structure
module Signals =
    let private generateUser id =
        {| id = id
           name = $"User{id}"
           email = $"user{id}@example.com"
           active = id % 2 = 0
           score = (id * 13) % 100 |}
    
    let private generateProduct id =
        {| id = id
           name = $"Product {id}"
           price = decimal(id) * 9.99m
           category = if id % 3 = 0 then "Electronics" elif id % 3 = 1 then "Books" else "Clothing"
           inStock = id % 4 <> 0 |}
    
    let generate size =
        let rnd = Random(42) // Fixed seed for consistent results
        
        let signals = 
            {| timestamp = DateTimeOffset.UtcNow.ToString("O")
               version = "1.0"
               users = [| for i in 1..size -> generateUser i |]
               products = [| for i in 1..(size * 2) -> generateProduct i |]
               settings = {| theme = "dark"; notifications = true; autoSave = size % 2 = 0 |}
               counters = {| total = size * 3; active = size * 2; pending = size |} |}
        
        JsonSerializer.Serialize(signals)

/// Generate realistic JavaScript with proper structure and varying complexity  
module JavaScript =
    let private functions = [|
        "function updateCounter(id, value) {{ document.getElementById(id).textContent = value; }}"
        "function toggleVisibility(selector) {{ document.querySelector(selector).classList.toggle('hidden'); }}"
        "function validateForm(formId) {{ return document.getElementById(formId).checkValidity(); }}"
        "function handleApiResponse(data) {{ console.log('API Response:', data); updateUI(data); }}"
        "function debounce(func, wait) {{ let timeout; return function(...args) {{ clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }}; }}"
    |]
    
    let private statements = [|
        "console.log('Processing item {0}');"
        "const element{0} = document.createElement('div');"
        "element{0}.className = 'dynamic-item';"
        "element{0}.setAttribute('data-id', {0});"
        "document.body.appendChild(element{0});"
        "if (typeof window.datastar !== 'undefined') {{ window.datastar.store.{1} = {0}; }}"
    |]
    
    let private vars = [| "counter"; "status"; "value"; "index"; "result"; "data" |]
    
    let generate size =
        let rnd = Random(42) // Fixed seed for consistent results
        let sb = System.Text.StringBuilder()
        
        // Add some functions first
        let numFunctions = Math.Min(size / 3 + 1, functions.Length)
        for i in 0..(numFunctions - 1) do
            sb.AppendLine(functions.[i]) |> ignore
            
        sb.AppendLine() |> ignore
        
        // Add statements
        for i in 1..size do
            let statement = statements.[rnd.Next(statements.Length)]
            let variable = vars.[rnd.Next(vars.Length)]
            let formatted = String.Format(statement, i, variable)
            sb.AppendLine(formatted) |> ignore
            
        sb.ToString()

/// Generate realistic Server-Sent Events with consistent structure
module ServerSentEvents =
    let createPatchElementsEvent size eventId =
        { EventType = PatchElements
          Id = eventId
          Retry = TimeSpan.FromSeconds(1.0)
          DataLines = StringValues(Html.generate size) }
    
    let createPatchSignalsEvent size eventId =
        { EventType = PatchSignals
          Id = eventId  
          Retry = TimeSpan.FromSeconds(1.0)
          DataLines = StringValues(Signals.generate size) }
    
    let createExecuteScriptEvent size eventId =
        { EventType = PatchElements // ExecuteScript uses PatchElements internally
          Id = eventId
          Retry = TimeSpan.FromSeconds(1.0)
          DataLines = StringValues($"<script>{JavaScript.generate size}</script>") }

/// Standard size definitions for consistent benchmarking
module Sizes =
    let Small = 1
    let Medium = 10  
    let Large = 50
    let ExtraLarge = 100
