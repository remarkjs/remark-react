import type {Root} from 'mdast'
import type {ReactElement} from 'react'
import type {Plugin} from 'unified'
import type {Options} from './lib/index.js'

/**
 * Plugin to compile to React
 *
 * @param options
 *   Configuration.
 */
// Note: defining all react nodes as result value seems to trip TS up.
declare const remarkReact: Plugin<[Options], Root, ReactElement<unknown>>
export default remarkReact
export type {Options}
