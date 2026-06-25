---
"vue-lynx": patch
---

Make `vue-lynx/internal/ops` the single source of truth for the BG↔MT wire protocol: add typed `Op` tuple shapes and an `OP_ARITY` table. The BG serializer (`pushOp`) and MT decoder (`applyOps`) now assert arg counts against the shared schema in dev builds, so a field-count drift between the two threads is reported immediately instead of silently misaligning the rest of the ops batch. The MT decoder also aborts a batch on an unknown opcode (dev error) rather than interpreting following payload as opcodes. No production behavior change.
