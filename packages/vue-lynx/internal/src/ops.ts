// Copyright 2026 Xuan Huang (huxpro). All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Flat-array operation codes — the wire protocol between BG Thread and Main Thread.
 *
 * The buffer is a single flat array (all values JSON-serializable): each op is
 * an opcode followed by a fixed number of payload args, then the next opcode,
 * and so on. The BG thread serializes ops here (../../runtime/src/ops.ts); the
 * MT thread decodes them with a sequential cursor
 * (../../main-thread/src/ops-apply.ts).
 *
 * Because the cursor is sequential, a single arity/order mismatch between the
 * two sides misaligns the entire rest of the batch. To prevent that drift, this
 * module is the *single source of truth* for each op's shape:
 *   - {@link Op} tuple types document the field order/types.
 *   - {@link OP_ARITY} records the payload arg count (excluding the opcode).
 * Both sides assert against {@link OP_ARITY} in dev builds.
 */
export const OP = {
  CREATE: 0,
  CREATE_TEXT: 1,
  INSERT: 2,
  REMOVE: 3,
  SET_PROP: 4,
  SET_TEXT: 5,
  SET_EVENT: 6,
  REMOVE_EVENT: 7,
  SET_STYLE: 8,
  SET_CLASS: 9,
  SET_ID: 10,
  SET_WORKLET_EVENT: 11,
  SET_MT_REF: 12,
  INIT_MT_REF: 13,
  SET_SCOPE_ID: 14,
} as const;

export type OpCode = (typeof OP)[keyof typeof OP];

// --- Op tuple shapes (opcode + payload). The field names are documentation;
// they are the canonical order both threads must agree on. ---

export type CreateOp = [code: typeof OP.CREATE, id: number, type: string];
export type CreateTextOp = [code: typeof OP.CREATE_TEXT, id: number];
/** anchorId=-1 means append. */
export type InsertOp = [
  code: typeof OP.INSERT,
  parentId: number,
  childId: number,
  anchorId: number,
];
export type RemoveOp = [code: typeof OP.REMOVE, parentId: number, childId: number];
export type SetPropOp = [code: typeof OP.SET_PROP, id: number, key: string, value: unknown];
export type SetTextOp = [code: typeof OP.SET_TEXT, id: number, text: string];
export type SetEventOp = [
  code: typeof OP.SET_EVENT,
  id: number,
  eventType: string,
  eventName: string,
  sign: unknown,
];
export type RemoveEventOp = [
  code: typeof OP.REMOVE_EVENT,
  id: number,
  eventType: string,
  eventName: string,
];
export type SetStyleOp = [code: typeof OP.SET_STYLE, id: number, style: unknown];
export type SetClassOp = [code: typeof OP.SET_CLASS, id: number, className: string];
export type SetIdOp = [
  code: typeof OP.SET_ID,
  id: number,
  idString: string | null | undefined,
];
export type SetWorkletEventOp = [
  code: typeof OP.SET_WORKLET_EVENT,
  id: number,
  eventType: string,
  eventName: string,
  workletCtx: unknown,
];
export type SetMtRefOp = [code: typeof OP.SET_MT_REF, id: number, refImpl: unknown];
export type InitMtRefOp = [code: typeof OP.INIT_MT_REF, wvid: number, initValue: unknown];
/** Vue scoped CSS support. */
export type SetScopeIdOp = [code: typeof OP.SET_SCOPE_ID, id: number, cssId: number];

export type Op =
  | CreateOp
  | CreateTextOp
  | InsertOp
  | RemoveOp
  | SetPropOp
  | SetTextOp
  | SetEventOp
  | RemoveEventOp
  | SetStyleOp
  | SetClassOp
  | SetIdOp
  | SetWorkletEventOp
  | SetMtRefOp
  | InitMtRefOp
  | SetScopeIdOp;

/**
 * Payload arity per op: the number of args that follow the opcode. Must match
 * the corresponding {@link Op} tuple length minus 1. Both the BG serializer and
 * MT decoder assert against this in dev builds, so any drift in field count
 * surfaces immediately instead of silently misaligning the batch.
 */
export const OP_ARITY: Record<OpCode, number> = {
  [OP.CREATE]: 2,
  [OP.CREATE_TEXT]: 1,
  [OP.INSERT]: 3,
  [OP.REMOVE]: 2,
  [OP.SET_PROP]: 3,
  [OP.SET_TEXT]: 2,
  [OP.SET_EVENT]: 4,
  [OP.REMOVE_EVENT]: 3,
  [OP.SET_STYLE]: 2,
  [OP.SET_CLASS]: 2,
  [OP.SET_ID]: 2,
  [OP.SET_WORKLET_EVENT]: 4,
  [OP.SET_MT_REF]: 2,
  [OP.INIT_MT_REF]: 2,
  [OP.SET_SCOPE_ID]: 2,
};

/** Reverse opcode → name lookup for readable diagnostics (derived, no duplication). */
export const OP_NAME: Record<OpCode, string> = Object.fromEntries(
  Object.entries(OP).map(([name, code]) => [code, name]),
) as Record<OpCode, string>;
