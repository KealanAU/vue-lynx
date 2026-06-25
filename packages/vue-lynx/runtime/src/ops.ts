// Copyright 2026 Xuan Huang (huxpro). All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { OP_ARITY, OP_NAME, type OpCode } from 'vue-lynx/internal/ops';

export { OP } from 'vue-lynx/internal/ops';

let buffer: unknown[] = [];

export function pushOp(...args: unknown[]): void {
  if (__DEV__) {
    // Each pushOp call serializes exactly one op: opcode + its payload args.
    // Assert the arg count matches the shared schema so BG/MT protocol drift is
    // caught here (at the producer) instead of misaligning the MT cursor later.
    const code = args[0] as OpCode;
    const expected = OP_ARITY[code];
    if (expected === undefined) {
      console.error(`[vue-lynx] pushOp: unknown op code ${String(code)}`);
    } else if (args.length - 1 !== expected) {
      console.error(
        `[vue-lynx] pushOp(${OP_NAME[code]}): pushed ${args.length - 1} args, ` +
          `schema expects ${expected} — BG/MT protocol drift.`,
      );
    }
  }
  for (const arg of args) {
    buffer.push(arg);
  }
}

export function takeOps(): unknown[] {
  const b = buffer;
  buffer = [];
  return b;
}
