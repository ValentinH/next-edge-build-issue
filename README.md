Repository reproducing https://github.com/vercel/next.js/issues/51298 issue.

Fixed in 14.1.1-canary.69 🎉

## How to see the issue
- clone the repository
- `yarn install`
- `yarn build` (or even `NODE_OPTIONS='--max-old-space-size=4096' yarn build` to make it crash sooner)

The memory consumption goes super high (more than 16GB on my machine) and the command ultimately fails with:
<details>
<summary>FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory</summary>

<--- Last few GCs --->

[42616:0x158008000]    35153 ms: Scavenge 4086.3 (4135.9) -> 4084.0 (4136.7) MB, 4.1 / 0.0 ms  (average mu = 0.407, current mu = 0.205) allocation failure
[42616:0x158008000]    35159 ms: Scavenge 4087.1 (4136.7) -> 4084.7 (4137.4) MB, 4.4 / 0.0 ms  (average mu = 0.407, current mu = 0.205) allocation failure
[42616:0x158008000]    35549 ms: Scavenge 4088.0 (4137.7) -> 4085.5 (4146.4) MB, 386.1 / 0.0 ms  (average mu = 0.407, current mu = 0.205) allocation failure


<--- JS stacktrace --->

FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
 1: 0x1000f9c84 node::Abort() [/whatever/node]
 2: 0x1000f9e74 node::ModifyCodeGenerationFromStrings(v8::Local<v8::Context>, v8::Local<v8::Value>, bool) [/whatever/node]
 3: 0x10023e840 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [/whatever/node]
 4: 0x10023e800 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [/whatever/node]
 5: 0x1003c1d1c v8::internal::Heap::GarbageCollectionReasonToString(v8::internal::GarbageCollectionReason) [/whatever/node]
 6: 0x1003c083c v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [/whatever/node]
 7: 0x1003cbb84 v8::internal::Heap::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/whatever/node]
 8: 0x1003cbc18 v8::internal::Heap::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/whatever/node]
 9: 0x10039eaac v8::internal::Factory::NewFillerObject(int, bool, v8::internal::AllocationType, v8::internal::AllocationOrigin) [/whatever/node]
10: 0x1006d6bd0 v8::internal::Runtime_AllocateInYoungGeneration(int, unsigned long*, v8::internal::Isolate*) [/whatever/node]
11: 0x1009ea08c Builtins_CEntry_Return1_DontSaveFPRegs_ArgvOnStack_NoBuiltinExit [/whatever/node]
12: 0x1055b6444
13: 0x1052a2b90
14: 0x105115d20
15: 0x1055d44b4
16: 0x1052a40f4
17: 0x1055d34b0
18: 0x10504f498
19: 0x1055ccdb8
20: 0x1055d9aa4
21: 0x10097dd18 Builtins_InterpreterEntryTrampoline [/whatever/node]
22: 0x10504e368
23: 0x1052a1ab4
24: 0x104f61404
25: 0x104fe058c
26: 0x104ff0250
27: 0x104fdfc84
28: 0x10522f278
29: 0x100a32178 Builtins_PromiseFulfillReactionJob [/whatever/node]
30: 0x10099f6f4 Builtins_RunMicrotasks [/whatever/node]
31: 0x10097b9e4 Builtins_JSRunMicrotasksEntry [/whatever/node]
32: 0x10034e4cc v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&) [/whatever/node]
33: 0x10034e900 v8::internal::(anonymous namespace)::InvokeWithTryCatch(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&) [/whatever/node]
34: 0x10034e9ec v8::internal::Execution::TryRunMicrotasks(v8::internal::Isolate*, v8::internal::MicrotaskQueue*, v8::internal::MaybeHandle<v8::internal::Object>*) [/whatever/node]
35: 0x100371628 v8::internal::MicrotaskQueue::RunMicrotasks(v8::internal::Isolate*) [/whatever/node]
36: 0x100371ebc v8::internal::MicrotaskQueue::PerformCheckpoint(v8::Isolate*) [/whatever/node]
37: 0x100049c4c node::InternalCallbackScope::Close() [/whatever/node]
38: 0x10004977c node::CallbackScope::~CallbackScope() [/whatever/node]
39: 0x1000d1ae0 (anonymous namespace)::uvimpl::Work::AfterThreadPoolWork(int) [/whatever/node]
40: 0x10095c0c0 uv__work_done [/whatever/node]
41: 0x10095f85c uv__async_io [/whatever/node]
42: 0x1009715a8 uv__io_poll [/whatever/node]
43: 0x10095fcec uv_run [/whatever/node]
44: 0x10004a6d4 node::SpinEventLoop(node::Environment*) [/whatever/node]
45: 0x100133a90 node::NodeMainInstance::Run(int*, node::Environment*) [/whatever/node]
46: 0x100133770 node::NodeMainInstance::Run() [/whatever/node]
47: 0x1000cde38 node::Start(int, char**) [/whatever/node]
48: 0x19cd8fe50 start [/usr/lib/dyld]
error Command failed with signal "SIGABRT".

</details>
  
## What's the issue

We are in the process of migrating all our API routes to the Edge runtime. So far we have migrated 43 of them and for a few days we are getting build errors on Vercel: 
```
ERROR  run failed: command  exited (129)
Error: Command "turbo run build" exited with 129
BUILD_UTILS_SPAWN_129: Command "turbo run build" exited with 129
```

The build was actually also sometimes failing locally with the `Reached heap limit Allocation failed - JavaScript heap out of memory` error.

After digging a lot in our codebase to understand what was going on, we managed to specifically identify our Edge functions. These functions are using our generated GraphQL client that lives in a pretty large file (2.5MB) that contains all the possible operations.

I managed to create a reproduction in a greenfield Next.js project using the latest canary. However, to reach the same amount of memory, I had to create many more routes (200) to reproduce the crash. The main reason for this is that I'm not able to share our internal GraphQL client generated on our private schema. Therefore, I created a smaller client (3 times smaller) from the Gitlab GraphQL endpoint.

If I create the same scenario of 200 handlers but not using the Edge runtime, the build runs smoothly in under 10 seconds with no visible impact on my machine memory. To witness this, you can try the `serverless` branch of this repository.

### Expected Behavior

Compiling many Edge runtime API routes should be similar to Serverless API routes.
