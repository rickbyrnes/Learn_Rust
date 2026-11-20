/* Course content for Rustling.
   Each lesson: { id, num, title, desc, tags, readMin, intro, sections, keypoints, pitfalls, quiz } */
(function () {
  "use strict";

  const LESSONS = [
    /* ---------------------------------------------------------------- 01 */
    {
      id: "hello-cargo",
      num: 1,
      title: "Hello, Cargo",
      desc: "Toolchain, your first program, and how Rust builds things.",
      tags: ["basics", "tooling"],
      readMin: 6,
      intro: `
        <p>Rust is a <strong>compiled, statically typed</strong> language with no garbage collector and no runtime to speak of. You write source code, the compiler turns it into a native executable, and that executable runs on its own. This lesson gets the toolchain in place and explains the two commands you'll use constantly: <code class="inline">rustc</code> and <code class="inline">cargo</code>.</p>
        <p>If you come from Python or JavaScript, the big mental shift is that there is a distinct <strong>compile step</strong>. The compiler catches whole categories of bugs before your program ever runs.</p>`,
      sections: [
        {
          h: "Install the toolchain",
          body: `<p>Install Rust with <code class="inline">rustup</code>, the official toolchain manager. It installs the compiler (<code class="inline">rustc</code>), the package manager / build tool (<code class="inline">cargo</code>), and keeps them updated.</p>`,
          code: [{
            file: "terminal",
            source: `# Install (Linux / macOS)\ncurl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh\n\n# Verify\nrustc --version\ncargo --version`,
            note: "On Windows, download rustup-init.exe from rustup.rs. Everything else is identical."
          }]
        },
        {
          h: "Your first program",
          body: `<p>The entry point of every Rust binary is the <code class="inline">main</code> function. Note the syntax: <code class="inline">fn</code> declares a function, <code class="inline">()</code> is the parameter list, and the body goes in <code class="inline">{}</code>. Statements end with a semicolon.</p>
          <p><code class="inline">println!</code> is a <strong>macro</strong>, not a function — the <code class="inline">!</code> is your clue. Macros expand to code at compile time; <code class="inline">println!</code> checks your format string at compile time too.</p>`,
          code: [{
            file: "main.rs",
            source: `fn main() {
    println!("Hello, world!");
    let name = "Rust";
    println!("Learning {}", name);
}`,
            note: "Compile with `rustc main.rs`, then run the produced `main` executable."
          }]
        },
        {
          h: "Cargo projects",
          body: `<p>For anything beyond a single file, use Cargo. It manages builds, dependencies, tests, and more. A new project looks like this:</p>`,
          code: [{
            file: "terminal",
            source: `cargo new hello_rust\ncd hello_rust\ncargo run     # compile AND run\ncargo build   # compile only\ncargo check   # type-check only (fast!)`,
            note: "Use cargo check while developing — it skips code generation and is much faster."
          }, {
            file: "project tree",
            source: `hello_rust/\n├── Cargo.toml      # manifest + dependencies\n└── src/\n    └── main.rs     # binary entry point`,
            note: "Cargo also creates a .gitignore and a git repo by default."
          }]
        },
        {
          h: "What compilation buys you",
          body: `<p>There's no interpreter and no virtual machine. The compiler does the work up front: type checking, borrow checking, and optimization. The result is a standalone binary that starts fast and uses no garbage collector.</p>`,
          callout: {
            type: "note",
            title: "If you know Python / JS",
            body: `<p>There's no REPL-driven workflow here and no dynamic typing. You'll see more errors at compile time, but far fewer at 2 a.m. in production. Think of the compiler as a very thorough code reviewer that never gets tired.</p>`
          }
        }
      ],
      keypoints: [
        "<code class='inline'>rustup</code> installs and manages the toolchain; <code class='inline'>cargo</code> is your day-to-day driver.",
        "Every binary starts at <code class='inline'>fn main()</code>; <code class='inline'>println!</code> is a macro.",
        "<code class='inline'>cargo check</code> type-checks quickly; <code class='inline'>cargo run</code> builds and executes.",
        "Compilation means no runtime, no GC, and errors caught before launch."
      ],
      pitfalls: [
        "Forgetting the <code class='inline'>!</code> on <code class='inline'>println!</code> — it's a macro, not a function.",
        "Editing a file but running <code class='inline'>rustc</code> on a stale copy instead of using <code class='inline'>cargo run</code>."
      ],
      quiz: [
        {
          q: "Which command type-checks a Cargo project fastest, without producing a binary?",
          options: ["cargo build", "cargo check", "cargo run", "rustup check"],
          answer: 1,
          explain: "<code class='inline'>cargo check</code> runs the compiler's analysis passes but skips code generation and linking, making it the fastest feedback loop."
        },
        {
          q: "What does the '!' in println! indicate?",
          options: ["It's an operator that negates the result", "It's a macro invocation", "It prints to stderr", "It makes the print asynchronous"],
          answer: 1,
          explain: "The exclamation mark marks a macro call. Macros are expanded at compile time, and println! validates its format string then."
        }
      ]
    },

    /* ---------------------------------------------------------------- 02 */
    {
      id: "variables-mutability",
      num: 2,
      title: "Variables & Mutability",
      desc: "let, mut, shadowing, constants, and type inference.",
      tags: ["basics", "ownership-lite"],
      readMin: 7,
      intro: `
        <p>In Rust, variables are <strong>immutable by default</strong>. You have to explicitly opt into mutation with <code class="inline">mut</code>. This is one of the first things that feels different if you're used to languages where variables are mutable unless you say otherwise.</p>
        <p>This isn't pedantry: knowing that a binding can't change lets the compiler reason aggressively about your code and makes concurrent code far safer.</p>`,
      sections: [
        {
          h: "let bindings",
          body: `<p>You create a binding with <code class="inline">let</code>. To make it mutable, write <code class="inline">let mut</code>. Try assigning to an immutable binding and the compiler will stop you.</p>`,
          code: [{
            file: "main.rs",
            source: `fn main() {
    let x = 5;        // immutable
    // x = 6;         // error: cannot assign twice to immutable variable
\n    let mut y = 5;    // mutable
    y = 6;            // fine
    println!("x = {}, y = {}", x, y);
}`,
            note: "The compiler doesn't just flag the bad line — it usually suggests adding `mut`."
          }]
        },
        {
          h: "Shadowing",
          body: `<p>You can declare a new binding with the same name, which <strong>shadows</strong> the previous one. Shadowing is different from <code class="inline">mut</code>: the new binding is genuinely a new variable, and it can even have a different type. This is idiomatic Rust for transforming a value through several steps.</p>`,
          code: [{
            file: "main.rs",
            source: `fn main() {
    let spaces = "   ";
    let spaces = spaces.len();   // shadows: &str -> usize

    let x = 5;
    let x = x + 1;               // shadows: i32 -> i32
    let x = x * 2;
    println!("x = {}", x);       // 12
}`,
            note: "With `mut`, reassigning must keep the same type; with shadowing it need not."
          }]
        },
        {
          h: "Constants and statics",
          body: `<p><code class="inline">const</code> values are always immutable and must have an explicit type. They can be declared in any scope, including globally. <code class="inline">static</code> is similar but represents a fixed memory address — useful for global state (and requires care with concurrency).</p>`,
          code: [{
            file: "main.rs",
            source: `const MAX_POINTS: u32 = 100_000;
static GREETING: &str = "hello";

fn main() {
    println!("{} / {}", MAX_POINTS, GREETING);
}`,
            note: "Underscores in numeric literals are ignored: 100_000 reads as 100000."
          }]
        },
        {
          h: "Type inference",
          body: `<p>Rust infers types from context, but every value has exactly one known type at compile time. If inference is ambiguous, you add an annotation. Numeric literals default to <code class="inline">i32</code>, and floating-point literals default to <code class="inline">f64</code>.</p>`,
          callout: {
            type: "tip",
            title: "Let the compiler help",
            body: `<p>When you see a type error, read it carefully — the compiler usually tells you which type it inferred and which one it expected. Annotation is the escape hatch, not the default.</p>`
          }
        }
      ],
      keypoints: [
        "Bindings are immutable unless you write <code class='inline'>let mut</code>.",
        "Shadowing creates a new variable and may change its type.",
        "<code class='inline'>const</code> needs an explicit type; <code class='inline'>static</code> denotes a fixed memory location.",
        "Types are inferred, but statically fixed at compile time."
      ],
      pitfalls: [
        "Thinking shadowing is the same as mutation — it isn't; the old binding still exists, just hidden.",
        "Assuming a number's type is obvious; defaults are i32 / f64 unless context says otherwise."
      ],
      quiz: [
        {
          q: "What is required to reassign a new value to an existing variable binding?",
          options: ["Declare it with `let mut`", "Use the `change` keyword", "Wrap it in a RefCell", "Nothing — Rust bindings are mutable by default"],
          answer: 0,
          explain: "Rust bindings are immutable by default. Adding `mut` at declaration opts into reassignment."
        },
        {
          q: "Which statement about shadowing is TRUE?",
          options: [
            "It is identical to using `mut`",
            "It can change the variable's type because it creates a new binding",
            "It only works inside loops",
            "It requires the `shadow` keyword"
          ],
          answer: 1,
          explain: "Shadowing introduces a new binding with the same name, and the new binding may have a completely different type."
        }
      ]
    },

    /* ---------------------------------------------------------------- 03 */
    {
      id: "primitive-types",
      num: 3,
      title: "Primitive Types",
      desc: "Integers, floats, bools, chars, tuples, and arrays.",
      tags: ["basics", "types"],
      readMin: 8,
      intro: `
        <p>Rust has a small, predictable set of built-in types. Unlike dynamically typed languages, every value has a size known at compile time (the one wrinkle — <code class="inline">str</code> — we'll handle when we get to ownership). Knowing these types makes error messages much less intimidating.</p>`,
      sections: [
        {
          h: "Scalar types",
          body: `<p><strong>Integers</strong> come in signed (<code class="inline">i8</code> … <code class="inline">i128</code>) and unsigned (<code class="inline">u8</code> … <code class="inline">u128</code>) flavors, plus <code class="inline">isize</code> / <code class="inline">usize</code> which match the target architecture's pointer size. Default: <code class="inline">i32</code>.</p>
          <p><strong>Floats</strong> are <code class="inline">f32</code> and <code class="inline">f64</code> (default). <strong>Booleans</strong> are <code class="inline">bool</code>. <strong>Chars</strong> are <code class="inline">char</code> — a 4-byte Unicode scalar value, not just ASCII.</p>`,
          code: [{
            file: "types.rs",
            source: `fn main() {
    let a: u32 = 42;          // explicit unsigned
    let b = 1_000_000;        // i32 by default
    let c: f32 = 3.14;
    let d = 2.71;             // f64 by default
    let t = true;             // bool
    let emoji = '🦀';         // char (Unicode scalar)
\n    println!("{} {} {} {} {} {}", a, b, c, d, t, emoji);
}`,
            note: "`usize` is the type used for collection lengths and indexing."
          }]
        },
        {
          h: "Compound types",
          body: `<p>A <strong>tuple</strong> groups values of different types into one compound value; access elements with <code class="inline">.0</code>, <code class="inline">.1</code>, etc. An <strong>array</strong> holds a fixed number of same-type elements; unlike a vector, its length is part of its type and it cannot grow.</p>`,
          code: [{
            file: "compound.rs",
            source: `fn main() {
    let tup: (i32, f64, char) = (500, 6.4, 'z');
    let (x, y, z) = tup;               // destructuring
    println!("{} {} {}", x, y, tup.2);

    let arr = [1, 2, 3, 4, 5];        // type: [i32; 5]
    let zeros = [0u8; 3];             // repeat syntax
    println!("first = {}, zeros = {:?}", arr[0], zeros);
}`,
            note: "Tuples and arrays have fixed sizes — neither can grow after creation."
          }]
        },
        {
          h: "The unit type",
          body: `<p>There's a type called the <strong>unit type</strong>, written <code class="inline">()</code>. It's a tuple with zero elements. Functions that don't return a meaningful value implicitly return <code class="inline">()</code>. You'll also see it as the "empty" variant of generic types, like <code class="inline">Result&lt;(), Error&gt;</code>.</p>`,
          callout: {
            type: "warn",
            title: "Integer overflow",
            body: `<p>In debug builds, overflowing an integer arithmetic operation <strong>panics</strong>. In release builds it wraps (two's complement). Rust won't silently give you a huge wrong number in debug — but don't rely on wrapping; use checked arithmetic (<code class='inline'>checked_add</code> and friends) when overflow is a real possibility.</p>`
          }
        }
      ],
      keypoints: [
        "Integers: i8–i128 / u8–u128, plus isize/usize; default i32.",
        "Floats default to f64; char is a 4-byte Unicode scalar.",
        "Tuples mix types and use .0/.1 access; arrays are fixed-size and homogeneous.",
        "<code class='inline'>()</code> is the unit type — the implicit return of functions with no value."
      ],
      pitfalls: [
        "Confusing <code class='inline'>char</code> (single Unicode scalar, 4 bytes) with a string.",
        "Forgetting arrays are fixed-length — reach for <code class='inline'>Vec&lt;T&gt;</code> when you need growth."
      ],
      quiz: [
        {
          q: "What is the type of a numeric literal like `42` when nothing constrains it?",
          options: ["u8", "i32", "usize", "f64"],
          answer: 1,
          explain: "Unannotated integer literals default to i32. Floating-point literals default to f64."
        },
        {
          q: "Which type can hold elements of different kinds in one value?",
          options: ["Array", "Slice", "Tuple", "Vec"],
          answer: 2,
          explain: "A tuple can hold values of different types. Arrays, slices, and Vec<T> require all elements to share one type."
        }
      ]
    },

    /* ---------------------------------------------------------------- 04 */
    {
      id: "functions-control-flow",
      num: 4,
      title: "Functions & Control Flow",
      desc: "Expressions, if, match, and the three loops.",
      tags: ["basics", "control-flow"],
      readMin: 9,
      intro: `
        <p>Rust is an <strong>expression-oriented</strong> language. Most things evaluate to a value, including <code class="inline">if</code> blocks and <code class="inline">match</code> arms. Understanding the difference between statements and expressions unlocks a lot of idiomatic Rust.</p>`,
      sections: [
        {
          h: "Functions",
          body: `<p>Declare functions with <code class="inline">fn</code>, give each parameter a type, and declare the return type after <code class="inline">-&gt;</code>. To return a value, write an expression as the last line — with <strong>no semicolon</strong>. Adding a semicolon turns it into a statement that returns <code class="inline">()</code>.</p>`,
          code: [{
            file: "functions.rs",
            source: `fn add_one(x: i32) -> i32 {
    x + 1          // expression: no semicolon => returned
}

fn noisy(x: i32) -> i32 {
    let y = x + 1; // statement: semicolon
    y              // returned
}

fn main() {
    println!("{}", add_one(4));
}`,
            note: "Early returns use the `return` keyword, but the trailing-expression style is more idiomatic."
          }]
        },
        {
          h: "if is an expression",
          body: `<p>Conditions don't need parentheses. Since <code class="inline">if</code> is an expression, you can use its value directly — but all branches must produce the same type. There's no truthiness: conditions must be an actual <code class="inline">bool</code>.</p>`,
          code: [{
            file: "if_expr.rs",
            source: `fn main() {
    let number = 7;
    let label = if number % 2 == 0 { "even" } else { "odd" };
    println!("{} is {}", number, label);

    // if let: match one pattern, ignore the rest
    let maybe = Some(5);
    if let Some(v) = maybe {
        println!("got {}", v);
    }
}`,
            note: "Rust has no ternary operator — `if`/`else` as an expression fills that role."
          }]
        },
        {
          h: "Loops",
          body: `<p>Rust has <code class="inline">loop</code> (infinite until <code class="inline">break</code>), <code class="inline">while</code> (condition-driven), and <code class="inline">for</code> (iterate over a collection). <code class="inline">loop</code> can also <em>return a value</em> via <code class="inline">break value</code>. Ranges like <code class="inline">0..5</code> are lazy iterators.</p>`,
          code: [{
            file: "loops.rs",
            source: `fn main() {
    for i in 0..5 {           // 0,1,2,3,4
        println!("i = {}", i);
    }

    let mut n = 3;
    while n > 0 {
        println!("countdown {}", n);
        n -= 1;
    }

    let counter = loop {
        break 42;             // loop returns a value
    };
    println!("answer = {}", counter);
}`,
            note: "`for` loops are the most common — they're safe and can't go out of bounds."
          }]
        },
        {
          h: "match: exhaustive branching",
          body: `<p><code class="inline">match</code> compares a value against patterns and <strong>must cover every possibility</strong>. That exhaustiveness is a superpower: add a new enum variant and the compiler points at every place you forgot to handle it. Use <code class="inline">_</code> as a catch-all when you really do want to ignore the rest.</p>`,
          code: [{
            file: "match.rs",
            source: `fn main() {
    let coin = 2;
    let name = match coin {
        1 => "penny",
        2 => "nickel",
        5 => "dime",
        other => {            // binds the value
            println!("unknown {}", other);
            "other"
        }
    };
    println!("{}", name);
}`,
            note: "Each arm is an expression; all arms must produce the same type."
          }]
        }
      ],
      keypoints: [
        "Functions return their last expression (no semicolon) or use <code class='inline'>return</code>.",
        "<code class='inline'>if</code> and <code class='inline'>match</code> are expressions — all branches must agree on type.",
        "Conditions must be bool; there is no truthiness or ternary operator.",
        "<code class='inline'>match</code> must be exhaustive; <code class='inline'>_</code> is the catch-all."
      ],
      pitfalls: [
        "Adding a semicolon to the return expression of a function (it then returns <code class='inline'>()</code>).",
        "Using a number or string as an <code class='inline'>if</code> condition — Rust requires a real bool."
      ],
      quiz: [
        {
          q: "Why does this function fail to compile? `fn f() -> i32 { 5; }`",
          options: [
            "i32 can't be returned",
            "The semicolon makes `5;` a statement, so the function returns ()",
            "Functions need a `return` keyword always",
            "Missing a lifetime annotation"
          ],
          answer: 1,
          explain: "The semicolon turns `5` into a statement. The function therefore returns the unit type `()` and mismatches the declared `i32`. Remove it: `fn f() -> i32 { 5 }`."
        },
        {
          q: "Which loop returns a value to the caller via `break value`?",
          options: ["for", "while", "loop", "None of them"],
          answer: 2,
          explain: "Only `loop` supports `break value`, which makes the loop expression evaluate to that value."
        }
      ]
    },

    /* ---------------------------------------------------------------- 05 */
    {
      id: "ownership",
      num: 5,
      title: "Ownership & Borrowing",
      desc: "The idea that makes Rust Rust: moves, references, and the borrow checker.",
      tags: ["core", "hard"],
      readMin: 14,
      intro: `
        <p>This is the lesson. Ownership is Rust's central feature — the mechanism that gives it memory safety without a garbage collector. If you understand this, the rest of the language falls into place. If you don't, everything else feels like arbitrary rules.</p>
        <p>The short version: <strong>every value has one owner; when the owner goes out of scope, the value is dropped.</strong> The compiler enforces this with a set of rules called the borrow checker.</p>`,
      sections: [
        {
          h: "The three rules",
          body: `<ol>
            <li>Each value in Rust has an <strong>owner</strong>.</li>
            <li>There can only be one owner at a time.</li>
            <li>When the owner goes out of scope, the value is <strong>dropped</strong> (its memory/resources freed).</li>
          </ol>
          <p>For simple fixed-size types like integers, copying is cheap, so they implement the <code class="inline">Copy</code> trait and are duplicated implicitly. But heap-allocated types like <code class="inline">String</code> and <code class="inline">Vec&lt;T&gt;</code> are <strong>moved</strong>, not copied.</p>`,
          code: [{
            file: "move.rs",
            source: `fn main() {
    let s1 = String::from("hello");
    let s2 = s1;              // s1 is MOVED into s2
    // println!("{}", s1);    // error: s1 was moved

    println!("{}", s2);       // ok

    let x = 5;
    let y = x;                // i32 is Copy, so this duplicates
    println!("{} {}", x, y);  // both usable
}`,
            note: "A move is Rust's answer to a shallow copy plus invalidation of the original — no double-free, no dangling pointer."
          }]
        },
        {
          h: "String vs &str",
          body: `<p>A <code class="inline">String</code> owns its heap buffer. A <code class="inline">&amp;str</code> is a <strong>string slice</strong> — a borrowed view into string data. Literals like <code class='inline'>"hello"</code> are <code class='inline'>&amp;str</code>. Functions that only read a string should usually take <code class='inline'>&amp;str</code> so they don't steal ownership from the caller.</p>`,
          code: [{
            file: "borrow.rs",
            source: `fn length(s: &str) -> usize {   // borrow, not own
    s.len()
}

fn main() {
    let owned = String::from("hello");
    let n = length(&owned);   // pass a reference
    println!("{} {}", n, owned);  // still ours!
}`,
            note: "Passing `&owned` creates a reference; the function borrows it and gives it back implicitly when it returns."
          }]
        },
        {
          h: "References & the borrow rules",
          body: `<p>A <code class="inline">&amp;</code> creates a shared reference; <code class="inline">&amp;mut</code> creates a mutable reference. The borrow checker enforces two rules at compile time:</p>
          <ul>
            <li>You may have <strong>either</strong> one mutable reference <strong>or</strong> any number of shared references — never both.</li>
            <li>References must always be valid (no use-after-free, no dangling references).</li>
          </ul>
          <p>These rules are what make data races impossible in safe Rust.</p>`,
          code: [{
            file: "references.rs",
            source: `fn main() {
    let mut s = String::from("hello");

    let r1 = &s;
    let r2 = &s;        // many shared borrows: OK
    println!("{} {}", r1, r2);

    let r3 = &mut s;    // OK here: r1/r2 no longer used
    r3.push_str(", world");
    println!("{}", r3);
}`,
            note: "Non-lexical lifetimes (NLL) let borrows end at their last use, so this is allowed."
          }, {
            file: "error.rs",
            source: `fn main() {
    let mut s = String::from("hi");
    let r1 = &s;
    let r2 = &mut s;   // error: cannot borrow as mutable
    println!("{}", r1); // because r1 is shared and still used
    println!("{}", r2);
}`,
            note: "A shared borrow and a mutable borrow cannot overlap in the same scope."
          }]
        },
        {
          h: "Slices",
          body: `<p>Slices are references to a contiguous sequence — for example <code class='inline'>&amp;[i32]</code> or <code class='inline'>&amp;str</code>. They carry a length, so indexing is bounds-checked at runtime. A range like <code class='inline'>&amp;arr[1..3]</code> borrows part of an array.</p>`,
          callout: {
            type: "tip",
            title: "The mental model",
            body: `<p>Ownership is about <strong>who is responsible for cleaning up</strong>. Borrowing is about <strong>lending a value temporarily</strong> without handing over that responsibility. The borrow checker just makes sure you never lend the same thing both exclusively and shared at the same time.</p>`
          }
        }
      ],
      keypoints: [
        "One owner per value; dropping the owner frees the value.",
        "<code class='inline'>Copy</code> types duplicate implicitly; <code class='inline'>String</code>/<code class='inline'>Vec</code> are moved.",
        "Prefer <code class='inline'>&amp;str</code> / <code class='inline'>&amp;T</code> parameters when you only need to read.",
        "Many shared borrows OR one mutable borrow — never both at once."
      ],
      pitfalls: [
        "Using a value after moving it into a function or another binding.",
        "Holding a shared reference and trying to mutate through another binding.",
        "Fighting the borrow checker by cloning everything — usually a sign the design needs a borrow instead."
      ],
      quiz: [
        {
          q: "After `let s2 = s1;` where s1 is a String, why can't you use s1?",
          options: [
            "String is too large to copy",
            "Ownership was moved to s2, so s1 is invalid",
            "Strings are immutable by default",
            "You need to call s1.free() first"
          ],
          answer: 1,
          explain: "String owns a heap allocation and is not Copy. The assignment moves ownership to s2 and invalidates s1, preventing a double free."
        },
        {
          q: "Which combination of borrows is allowed at the same time?",
          options: [
            "Two &mut references to the same value",
            "One &mut and one & reference to the same value",
            "Multiple & (shared) references to the same value",
            "None — borrowing is always exclusive"
          ],
          answer: 2,
          explain: "You can have any number of shared `&` references, OR exactly one `&mut` — but never both overlapping."
        },
        {
          q: "What does taking `&owned` as a function argument do?",
          options: [
            "Moves ownership into the function",
            "Lends a reference so the caller keeps ownership",
            "Copies the heap data",
            "Creates a garbage-collected pointer"
          ],
          answer: 1,
          explain: "`&owned` borrows the value. The function can read (or with `&mut`, mutate) it, but ownership stays with the caller."
        }
      ]
    },

    /* ---------------------------------------------------------------- 06 */
    {
      id: "structs-enums",
      num: 6,
      title: "Structs & Enums",
      desc: "Modeling your domain with custom types, methods, and Option.",
      tags: ["types", "modeling"],
      readMin: 10,
      intro: `
        <p>Rust doesn't have classes. Instead you define <strong>structs</strong> to group related data and <strong>enums</strong> to model values that can be one of several variants. Methods live in <code class="inline">impl</code> blocks. This gives you most of what OOP offers, without inheritance.</p>`,
      sections: [
        {
          h: "Structs and methods",
          body: `<p>A struct names each field and its type. An <code class="inline">impl</code> block associates functions with the struct. Methods take <code class='inline'>&amp;self</code> (borrow), <code class='inline'>&amp;mut self</code> (mutable borrow), or <code class='inline'>self</code> (consume). Associated functions without <code class='inline'>self</code> are like static methods — often used as constructors.</p>`,
          code: [{
            file: "structs.rs",
            source: `#[derive(Debug, Clone)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn new(w: u32, h: u32) -> Self {   // associated function
        Self { width: w, height: h }
    }

    fn area(&self) -> u32 {            // borrows self
        self.width * self.height
    }

    fn stretch(&mut self, by: u32) {   // mutably borrows self
        self.width += by;
    }
}

fn main() {
    let mut r = Rectangle::new(10, 20);
    println!("{:?} area = {}", r, r.area());
    r.stretch(5);
    println!("new width = {}", r.width);
}`,
            note: "`#[derive(Debug)]` auto-implements the Debug trait so `{:?}` works. `Clone` lets you explicitly duplicate the value."
          }]
        },
        {
          h: "Enums with data",
          body: `<p>Unlike enums in some languages, Rust enum variants can carry different payloads. This lets you model a closed set of states with their data attached, and pattern-match them exhaustively.</p>`,
          code: [{
            file: "enums.rs",
            source: `enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Text(String),
}

fn process(msg: Message) {
    match msg {
        Message::Quit => println!("bye"),
        Message::Move { x, y } => println!("move to {},{}", x, y),
        Message::Text(s) => println!("say {}", s),
    }
}

fn main() {
    process(Message::Text(String::from("hi")));
}`,
            note: "Add a new variant and the compiler finds every match that needs updating."
          }]
        },
        {
          h: "Option<T>",
          body: `<p>Rust has no <code class="inline">null</code>. Instead, the <code class="inline">Option&lt;T&gt;</code> enum encodes "maybe a value": <code class='inline'>Some(value)</code> or <code class='inline'>None</code>. Because it's a normal type, the compiler forces you to handle both cases — no surprise null dereferences.</p>`,
          code: [{
            file: "option.rs",
            source: `fn main() {
    let some: Option<i32> = Some(5);
    let none: Option<i32> = None;

    // Unwrap only when you are certain
    println!("{}", some.unwrap());

    // Safely handle both cases
    match none {
        Some(v) => println!("value {}", v),
        None => println!("nothing here"),
    }

    // Handy combinators
    println!("{:?}", some.map(|x| x * 2));  // Some(10)
}`,
            note: "`unwrap()` panics on None. Prefer `match`, `if let`, or combinators like `map` / `unwrap_or`."
          }]
        }
      ],
      keypoints: [
        "Structs group data; <code class='inline'>impl</code> blocks hold methods and constructors.",
        "<code class='inline'>&amp;self</code> borrows, <code class='inline'>&amp;mut self</code> mutates, <code class='inline'>self</code> consumes.",
        "Enum variants can carry their own data and are matched exhaustively.",
        "<code class='inline'>Option&lt;T&gt;</code> replaces null: Some(value) or None."
      ],
      pitfalls: [
        "Calling <code class='inline'>unwrap()</code> on an Option that might be None — a common panic source.",
        "Expecting inheritance — Rust uses composition, traits, and generics instead."
      ],
      quiz: [
        {
          q: "Which method signature lets a method modify the struct it's called on?",
          options: ["&self", "&mut self", "self", "static self"],
          answer: 1,
          explain: "`&mut self` takes a mutable borrow, allowing mutation. `&self` only borrows immutably, and `self` consumes the value."
        },
        {
          q: "How does Rust represent the absence of a value safely?",
          options: ["null", "Option<T> with Some/None", "undefined", "A null pointer"],
          answer: 1,
          explain: "Option<T> is an enum with Some(T) and None. There is no null in safe Rust, so the compiler makes you handle both cases."
        }
      ]
    },

    /* ---------------------------------------------------------------- 07 */
    {
      id: "result-errors",
      num: 7,
      title: "Result & Error Handling",
      desc: "Recoverable errors, the ? operator, and panic!.",
      tags: ["errors", "core"],
      readMin: 9,
      intro: `
        <p>Rust splits errors into two categories. <strong>Unrecoverable</strong> errors use <code class='inline'>panic!</code> — the program stops. <strong>Recoverable</strong> errors are values: <code class='inline'>Result&lt;T, E&gt;</code> is either <code class='inline'>Ok(value)</code> or <code class='inline'>Err(error)</code>. You handle them explicitly, and the compiler makes sure you don't ignore them.</p>`,
      sections: [
        {
          h: "Result<T, E>",
          body: `<p>Operations that can fail return a Result. You can pattern-match it, use combinators like <code class='inline'>map</code> and <code class='inline'>and_then</code>, or use the <code class='inline'>?</code> operator to propagate the error upward.</p>`,
          code: [{
            file: "result.rs",
            source: `use std::fs::read_to_string;

fn read(path: &str) -> Result<String, std::io::Error> {
    // ? unwraps Ok, or returns Err early on failure
    let contents = read_to_string(path)?;
    Ok(contents.to_uppercase())
}

fn main() {
    match read("notes.txt") {
        Ok(text) => println!("{}", text),
        Err(e) => eprintln!("failed: {}", e),
    }
}`,
            note: "`?` works only in functions that return Result (or Option). It's the idiomatic replacement for `try`/`catch`."
          }]
        },
        {
          h: "main can return Result",
          body: `<p>A <code class='inline'>main</code> function may return <code class='inline'>Result&lt;(), E&gt;</code>. If it returns <code class='inline'>Err</code>, the program exits with an error code and prints the Debug representation of the error. This keeps top-level error handling trivial.</p>`,
          code: [{
            file: "main.rs",
            source: `use std::fs::File;

fn main() -> Result<(), std::io::Error> {
    let _file = File::open("config.toml")?;
    println!("config opened");
    Ok(())
}`,
            note: "The unit type `()` is the success value when there's nothing meaningful to return."
          }]
        },
        {
          h: "unwrap / expect and panic!",
          body: `<p><code class='inline'>unwrap()</code> and <code class='inline'>expect("msg")</code> extract the value or <strong>panic</strong> on error. They're fine in examples, tests, and cases where failure is a bug — but avoid them in library code where callers need to handle failure gracefully.</p>`,
          code: [{
            file: "panic.rs",
            source: `fn main() {
    let good: Result<i32, &str> = Ok(7);
    println!("{}", good.unwrap());          // 7

    let bad: Result<i32, &str> = Err("oops");
    // bad.unwrap();                        // panics!
    // bad.expect("custom message");        // panics with message

    // panic! for unrecoverable states
    // panic!("something went terribly wrong");
}`,
            note: "Use `expect(\"why this can't fail\")` to document your assumption when you do choose to panic."
          }]
        }
      ],
      keypoints: [
        "<code class='inline'>Result&lt;T, E&gt;</code> models recoverable failure as a value.",
        "<code class='inline'>?</code> propagates errors early; use it in functions returning Result.",
        "<code class='inline'>main</code> may return <code class='inline'>Result&lt;(), E&gt;</code>.",
        "<code class='inline'>panic!</code>, <code class='inline'>unwrap</code>, and <code class='inline'>expect</code> are for unrecoverable cases."
      ],
      pitfalls: [
        "Sprinkling <code class='inline'>unwrap()</code> in library code — it turns recoverable errors into crashes.",
        "Forgetting that <code class='inline'>Result</code> is an enum and must be handled (Rust warns on unused Results)."
      ],
      quiz: [
        {
          q: "What does the ? operator do in a function returning Result?",
          options: [
            "Ignores all errors",
            "Unwraps Ok values and returns Err early on failure",
            "Converts Result into Option",
            "Logs the error and continues"
          ],
          answer: 1,
          explain: "`?` extracts the Ok value; if the value is Err, it returns that Err from the current function immediately."
        },
        {
          q: "Which of these will cause a panic if it receives an Err?",
          options: ["match", "if let", "unwrap()", "and_then()"],
          answer: 2,
          explain: "`unwrap()` panics on Err (or None). `match`, `if let`, and combinators like `and_then` handle it without panicking."
        }
      ]
    },

    /* ---------------------------------------------------------------- 08 */
    {
      id: "collections",
      num: 8,
      title: "Collections",
      desc: "Vec, String, and HashMap — growable data in Rust.",
      tags: ["data", "ownership"],
      readMin: 9,
      intro: `
        <p>Rust's standard library gives you growable collections that still obey ownership rules. The three you'll reach for constantly are <code class='inline'>Vec&lt;T&gt;</code> (ordered list), <code class='inline'>String</code> (owned UTF-8 text), and <code class='inline'>HashMap&lt;K, V&gt;</code> (key–value map).</p>`,
      sections: [
        {
          h: "Vec<T>",
          body: `<p>A vector is a growable array backed by heap memory. You can push elements, index into it, iterate over it, and borrow it. Indexing can panic if out of bounds; <code class='inline'>get()</code> returns an <code class='inline'>Option&lt;&amp;T&gt;</code> instead.</p>`,
          code: [{
            file: "vec.rs",
            source: `fn main() {
    let mut v = vec![1, 2, 3];       // macro shortcut
    v.push(4);

    println!("{}", v[0]);            // panics if out of bounds
    println!("{:?}", v.get(10));     // None, safe

    for x in &v {                   // borrow each element
        println!("{}", x);
    }

    // Ownership in loops: iterating by value moves elements
    for x in v {
        println!("{}", x);
    }
    // v can't be used here anymore
}`,
            note: "Iterate with `&v` to borrow, or `v` to consume — the compiler tracks which one you did."
          }]
        },
        {
          h: "String",
          body: `<p><code class='inline'>String</code> is an owned, growable UTF-8 string. You can append with <code class='inline'>push_str</code> / <code class='inline'>push</code>, concatenate with <code class='inline'>format!</code>, and get a borrowed <code class='inline'>&amp;str</code> slice. Remember from lesson 5: string indexing by byte is not allowed directly, because UTF-8 characters can span multiple bytes.</p>`,
          code: [{
            file: "string.rs",
            source: `fn main() {
    let mut s = String::from("hello");
    s.push_str(", world");
    s.push('!');

    let full = format!("{} has {} bytes", s, s.len());
    println!("{}", full);

    let slice = &s[0..5];           // byte indices must be char boundaries
    println!("slice = {}", slice);
}`,
            note: "Slicing at a non-boundary panics — Rust protects you from producing invalid UTF-8."
          }]
        },
        {
          h: "HashMap<K, V>",
          body: `<p>A hash map stores key–value pairs. Keys must implement <code class='inline'>Eq</code> and <code class='inline'>Hash</code>. Insertion moves the key and value in; <code class='inline'>get</code> returns an <code class='inline'>Option&lt;&amp;V&gt;</code>. Use <code class='inline'>entry</code> for the common "insert if missing, otherwise update" pattern.</p>`,
          code: [{
            file: "map.rs",
            source: `use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("blue"), 10);
    scores.insert(String::from("red"), 50);

    println!("{:?}", scores.get("blue"));

    // entry API: insert only if absent
    scores.entry(String::from("green")).or_insert(0);

    for (k, v) in &scores {
        println!("{}: {}", k, v);
    }
}`,
            note: "HashMap iteration order is unspecified — don't rely on it."
          }]
        }
      ],
      keypoints: [
        "<code class='inline'>Vec&lt;T&gt;</code> grows; iterate with <code class='inline'>&amp;v</code> to borrow or <code class='inline'>v</code> to consume.",
        "<code class='inline'>get()</code> returns Option instead of panicking on invalid indexes.",
        "<code class='inline'>String</code> is owned UTF-8; slices must land on character boundaries.",
        "<code class='inline'>HashMap</code> keys need Eq + Hash; use <code class='inline'>entry</code> for insert-or-update."
      ],
      pitfalls: [
        "Iterating a Vec by value and then trying to use it again — the values were moved.",
        "Slicing a String at arbitrary byte offsets with multi-byte characters."
      ],
      quiz: [
        {
          q: "What does `v.get(10)` return for a Vec with 3 elements?",
          options: ["A panic", "None", "An empty string", "The last element"],
          answer: 1,
          explain: "`get` returns `Option<&T>` — `Some(&value)` if the index exists, or `None` if it's out of bounds. No panic."
        },
        {
          q: "Why can't you index into a String with `s[0]` in Rust?",
          options: [
            "Strings are immutable",
            "UTF-8 characters can be multiple bytes, so a byte index may not be a char boundary",
            "Indexing strings is deprecated",
            "Strings live on the stack"
          ],
          answer: 1,
          explain: "String indexing is byte-based and UTF-8 characters vary in length; allowing arbitrary byte indexes could produce invalid UTF-8. Use `&s[..]` at char boundaries or iterate with `.chars()` / `.bytes()`."
        }
      ]
    },

    /* ---------------------------------------------------------------- 09 */
    {
      id: "traits-generics",
      num: 9,
      title: "Traits & Generics",
      desc: "Write code once for many types; define shared behavior with traits.",
      tags: ["advanced", "abstraction"],
      readMin: 10,
      intro: `
        <p>Generics let you write code that works over many types while keeping compile-time type safety. Traits define shared behavior — similar to interfaces in other languages, but with more flexibility. Together they are Rust's main tool for abstraction.</p>`,
      sections: [
        {
          h: "Generic functions",
          body: `<p>Type parameters go in angle brackets. Rust <strong>monomorphizes</strong> generics: it generates a specialized copy of the function for each concrete type used, so there's no runtime cost. You'll often constrain a generic type with a trait bound.</p>`,
          code: [{
            file: "generics.rs",
            source: `use std::fmt::Display;

fn loudest<T: Display>(a: &T, b: &T) -> String {
    format!("{} > {}", a, b)
}

fn main() {
    println!("{}", loudest(&10, &3));
    println!("{}", loudest(&"cat", &"dog"));
}`,
            note: "`T: Display` is a trait bound: T must implement Display. There's no boxing or vtable — it's compiled per type."
          }]
        },
        {
          h: "Defining and implementing traits",
          body: `<p>A trait is a set of method signatures. A type implements a trait with an <code class='inline'>impl ... for ...</code> block. Traits can have default method bodies. Orphan rules prevent you from implementing a foreign trait for a foreign type — one of the reasons Rust's ecosystem stays coherent.</p>`,
          code: [{
            file: "traits.rs",
            source: `trait Summary {
    fn summarize(&self) -> String;          // required
    fn author(&self) -> String { String::from("anonymous") } // default
}

struct Post { title: String }

impl Summary for Post {
    fn summarize(&self) -> String {
        format!("Post: {}", self.title)
    }
}

fn print_summary<T: Summary>(item: &T) {
    println!("{} by {}", item.summarize(), item.author());
}

fn main() {
    let p = Post { title: String::from("Hello") };
    print_summary(&p);
}`,
            note: "Traits can also be used as arguments via `impl Summary` — sugar for a generic with a bound."
          }]
        },
        {
          h: "Derived and common traits",
          body: `<p>You can auto-implement many standard traits with <code class='inline'>#[derive]</code>: <code class='inline'>Debug</code>, <code class='inline'>Clone</code>, <code class='inline'>PartialEq</code>, <code class='inline'>Eq</code>, <code class='inline'>PartialOrd</code>, <code class='inline'>Ord</code>, <code class='inline'>Hash</code>, and more. These unlock formatting, comparison, sorting, and use as HashMap keys.</p>`,
          callout: {
            type: "note",
            title: "Static vs dynamic dispatch",
            body: `<p>Generics and <code class='inline'>impl Trait</code> use <strong>static dispatch</strong> (fast, monomorphized). Trait objects like <code class='inline'>dyn Trait</code> use <strong>dynamic dispatch</strong> (a vtable) when you need a collection of mixed types implementing the same trait. Start with generics; reach for <code class='inline'>dyn</code> when you truly need heterogeneity.</p>`
          }
        }
      ],
      keypoints: [
        "Generics are monomorphized — specialized per type, no runtime overhead.",
        "Traits define shared behavior; bounds like <code class='inline'>T: Display</code> constrain generics.",
        "<code class='inline'>#[derive]</code> auto-implements common traits like Debug, Clone, PartialEq.",
        "Use <code class='inline'>dyn Trait</code> only when you need dynamic dispatch."
      ],
      pitfalls: [
        "Overusing <code class='inline'>dyn Trait</code> when a generic would be faster and simpler.",
        "Assuming generic code is dynamically typed — it's fully checked and specialized at compile time."
      ],
      quiz: [
        {
          q: "What happens to a generic function at compile time in Rust?",
          options: [
            "It runs through an interpreter",
            "A specialized copy is generated for each concrete type (monomorphization)",
            "It is boxed into a trait object",
            "Types are checked at runtime"
          ],
          answer: 1,
          explain: "Rust monomorphizes generics, producing specialized machine code per type — so generic code has no runtime dispatch cost."
        },
        {
          q: "Which attribute auto-implements traits like Debug and Clone for a struct?",
          options: ["#[derive(...)]", "#[implement]", "#[auto]", "#[trait]"],
          answer: 0,
          explain: "`#[derive(Debug, Clone, PartialEq)]` asks the compiler to generate implementations of those traits automatically."
        }
      ]
    },

    /* ---------------------------------------------------------------- 10 */
    {
      id: "modules-crates",
      num: 10,
      title: "Modules & Crates",
      desc: "Organize code, control visibility, and pull in dependencies.",
      tags: ["tooling", "project"],
      readMin: 8,
      intro: `
        <p>As projects grow, you need to organize code. Rust gives you modules (<code class='inline'>mod</code>), paths, and visibility (<code class='inline'>pub</code>). A <strong>crate</strong> is the unit of compilation — either a binary or a library. Cargo manages crates and their dependencies.</p>`,
      sections: [
        {
          h: "Modules and paths",
          body: `<p>Modules form a tree. Items are private to their parent module by default; <code class='inline'>pub</code> makes them visible outside. <code class='inline'>use</code> brings paths into scope. The <code class='inline'>crate::</code> prefix refers to the crate root.</p>`,
          code: [{
            file: "main.rs",
            source: `mod math {
    pub fn add(a: i32, b: i32) -> i32 { a + b }
    fn helper() {}   // private to math
}

use crate::math::add;

fn main() {
    println!("{}", add(2, 3));
    // math::helper();  // error: private
}`,
            note: "Privacy is enforced by the compiler — you can't accidentally depend on implementation details."
          }]
        },
        {
          h: "Splitting across files",
          body: `<p>A module can live in its own file. The classic layout has <code class='inline'>src/lib.rs</code> as the library root and <code class='inline'>src/main.rs</code> as the binary. A <code class='inline'>mod foo;</code> declaration looks for <code class='inline'>src/foo.rs</code> or <code class='inline'>src/foo/mod.rs</code>.</p>`,
          code: [{
            file: "project tree",
            source: `my_crate/\n├── Cargo.toml\n└── src/\n    ├── main.rs      # binary crate root\n    ├── lib.rs       # library crate root\n    ├── math.rs      # module: crate::math\n    └── math/\n        └── geometry.rs  # crate::math::geometry`,
            note: "A library crate lets other projects depend on your code."
          }]
        },
        {
          h: "Dependencies with Cargo",
          body: `<p>Add a dependency in <code class='inline'>Cargo.toml</code> under <code class='inline'>[dependencies]</code>. Cargo downloads it from crates.io, compiles it, and makes it available via <code class='inline'>use</code>. Cargo.lock pins exact versions for reproducible builds — commit it for binaries, and it's generated for libraries too.</p>`,
          code: [{
            file: "Cargo.toml",
            source: `[package]
name = "my_crate"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
rand = "0.8"`,
            note: "Use `cargo add <crate>` to add dependencies without editing the file by hand."
          }],
          callout: {
            type: "tip",
            title: "You've reached the end",
            body: `<p>You now know the core of Rust. From here, pick a project and build it — the compiler will teach you the rest. Check out the <strong>Cheat Sheet</strong> in the sidebar for a quick reference while you code.</p>`
          }
        }
      ],
      keypoints: [
        "Modules form a tree; items are private until marked <code class='inline'>pub</code>.",
        "<code class='inline'>use</code> imports paths; <code class='inline'>crate::</code> is the crate root.",
        "A crate is a binary or library; lib.rs and main.rs are the roots.",
        "Cargo.toml lists dependencies; Cargo.lock pins exact versions."
      ],
      pitfalls: [
        "Forgetting <code class='inline'>pub</code> on items you want other modules to use.",
        "Editing Cargo.lock manually instead of letting Cargo manage it."
      ],
      quiz: [
        {
          q: "What is an item's visibility by default inside a module?",
          options: ["Public", "Private to its parent module", "Crate-wide", "Depends on the edition"],
          answer: 1,
          explain: "Items are private to their parent module and its descendants until you mark them `pub`."
        },
        {
          q: "Which file declares dependencies for a Cargo project?",
          options: ["src/main.rs", "Cargo.lock", "Cargo.toml", "rust-toolchain.toml"],
          answer: 2,
          explain: "`Cargo.toml` is the manifest where you declare dependencies. `Cargo.lock` records the exact resolved versions."
        }
      ]
    }
  ];

  const CHEAT_SHEET = {
    title: "Rust Cheat Sheet",
    desc: "A compact reference to keep open while you code.",
    groups: [
      {
        title: "Variables & types",
        rows: [
          ["let x = 5;", "Immutable binding"],
          ["let mut x = 5;", "Mutable binding"],
          ["const X: u32 = 1;", "Constant (explicit type)"],
          ["let x: i32 = 5;", "Type annotation"],
          ["i8..i128 / u8..u128", "Signed / unsigned integers"],
          ["usize / isize", "Pointer-sized integer"],
          ["f32 / f64", "Floats (default f64)"],
          ["char", "Unicode scalar (4 bytes)"],
          ["(a, b)", "Tuple"],
          ["[1, 2, 3]", "Fixed-size array"]
        ]
      },
      {
        title: "Functions & control flow",
        rows: [
          ["fn f(x: i32) -> i32 { x }", "Function + return expression"],
          ["if cond { a } else { b }", "if is an expression"],
          ["match x { P => v, _ => d }", "Exhaustive pattern match"],
          ["for i in 0..10 {}", "Range loop"],
          ["while cond {}", "While loop"],
          ["loop { break 42; }", "Infinite loop returning a value"],
          ["if let Some(v) = opt {}", "Match one pattern"]
        ]
      },
      {
        title: "Ownership & references",
        rows: [
          ["&T", "Shared (immutable) reference"],
          ["&mut T", "Exclusive mutable reference"],
          ["String::from(\"hi\")", "Owned heap string"],
          ["&str", "Borrowed string slice"],
          ["T: Copy", "Cheaply duplicated on assignment"],
          ["move", "Force transfer of ownership"],
          ["&v[1..3]", "Borrowed slice"]
        ]
      },
      {
        title: "Structs, enums, errors",
        rows: [
          ["struct S { f: T }", "Struct definition"],
          ["impl S { fn m(&self) {} }", "Methods"],
          ["enum E { A, B(T) }", "Enum with variants"],
          ["Option<T> = Some | None", "Maybe a value (no null)"],
          ["Result<T, E> = Ok | Err", "Recoverable error"],
          ["expr?", "Propagate error early"],
          ["x.unwrap()", "Extract or panic"],
          ["panic!(\"msg\")", "Unrecoverable failure"]
        ]
      },
      {
        title: "Collections & traits",
        rows: [
          ["vec![1, 2, 3]", "Growable Vec"],
          ["v.push(x)", "Append to Vec"],
          ["v.get(i) -> Option<&T>", "Safe indexing"],
          ["HashMap::new()", "Key-value map"],
          ["format!(\"{} \", x)", "String formatting"],
          ["#[derive(Debug, Clone)]", "Auto-implement traits"],
          ["fn f<T: Trait>(x: T)", "Generic with trait bound"],
          ["dyn Trait", "Dynamic dispatch (trait object)"]
        ]
      },
      {
        title: "Cargo commands",
        rows: [
          ["cargo new name", "New project"],
          ["cargo build", "Compile"],
          ["cargo check", "Type-check (fast)"],
          ["cargo run", "Build + run"],
          ["cargo test", "Run tests"],
          ["cargo add crate", "Add dependency"],
          ["cargo fmt", "Format code"],
          ["cargo clippy", "Lint code"]
        ]
      }
    ]
  };

  window.COURSE = { lessons: LESSONS, cheatSheet: CHEAT_SHEET };
})();
