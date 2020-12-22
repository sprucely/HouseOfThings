import { StateMethods, SetStateAction, State } from '@hookstate/core';


export function clone<T>(state: T): T {
    return JSON.parse(JSON.stringify(state))
}
