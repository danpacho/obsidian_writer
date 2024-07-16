import type { PluginExecutionResponse } from '@obsidian_blogger/helpers/plugin'
import type { FileTreeNode, FileTreeParser } from '../../parser'
import type { BuildInformation } from '../core'
import {
    BuildPlugin,
    BuildPluginDynamicConfig,
    type BuildPluginStaticConfig,
} from './build.plugin'

/**
 * Configuration options for the WalkTreePlugin.
 */
export interface WalkTreePluginStaticConfig extends BuildPluginStaticConfig {}
export type WalkTreePluginDynamicConfig = BuildPluginDynamicConfig & {
    /**
     * Specifies files or folders to exclude from the tree walk.
     */
    exclude?: Array<string> | string | RegExp
    /**
     * Determines whether to skip folder nodes during the tree walk.
     * - If set to `true`, folder nodes will be skipped.
     * - If set to `false` or not provided, folder nodes will be included in the tree walk.
     */
    skipFolderNode?: boolean
    /**
     * The type of tree walk to perform.
     * - `DFS`: Depth-first search
     * - `BFS`: Breadth-first search
     */
    walkType?: 'DFS' | 'BFS'
}

/**
 * Abstract class representing a plugin for walking a tree during the build process.
 */
export abstract class WalkTreePlugin<
    Static extends WalkTreePluginStaticConfig = WalkTreePluginStaticConfig,
    Dynamic extends WalkTreePluginDynamicConfig = WalkTreePluginDynamicConfig,
> extends BuildPlugin<Static, Dynamic> {
    /**
     * Walking a original file tree for modifying the files
     */
    public abstract walk(
        /**
         * Current node
         */
        node: FileTreeNode,
        /**
         * Current node walk context
         */
        context: {
            /**
             * Children of the current node
             */
            children: Array<FileTreeNode> | undefined
            /**
             * Siblings of the current node
             */
            siblings: Array<FileTreeNode> | undefined
            /**
             * Current node index in the siblings list
             */
            siblingsIndex: number | undefined
        }
    ): Promise<void>

    /**
     * Optional cache checker function for determining if the build state and node information
     * should be cached.
     *
     * @returns A boolean indicating whether the build state and node information should be cached.
     */
    public override cacheChecker?: (
        /**
         * The build state of the file.
         */
        state: BuildInformation['build_state'],
        /**
         * The node information.
         */
        nodeInfo: {
            /**
             * The node of the file.
             */
            node: FileTreeNode
            /**
             * The children of the node.
             */
            children: Array<FileTreeNode> | undefined
        }
    ) => boolean

    public async execute(
        _: { stop: () => void; resume: () => void },
        context: {
            parser: FileTreeParser
            walkRoot?: FileTreeNode
        }
    ): Promise<PluginExecutionResponse> {
        this.$jobManager.registerJob({
            name: 'walk:tree',
            execute: async () => {
                const defaultOptions = {
                    type: this.dynamicConfig.walkType ?? 'DFS',
                    skipFolderNode: this.dynamicConfig.skipFolderNode ?? true,
                }
                await context.parser.walk(
                    this.walk,
                    context.walkRoot
                        ? {
                              ...defaultOptions,
                              walkRoot: context.walkRoot,
                          }
                        : defaultOptions
                )
            },
        })

        await this.$jobManager.processJobs()

        return this.$jobManager.history
    }
}
