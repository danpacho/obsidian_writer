import { FileReader } from '@obsidian_blogger/helpers'
import type { FileTreeNode } from 'packages/build_system/src/parser'
import { ParamAnalyzer } from '../../../../routes'
import {
    WalkTreePlugin,
    WalkTreePluginDynamicConfig,
    WalkTreePluginStaticConfig,
} from '../../walk.tree.plugin'
import {
    type ContentMetaGeneratorOptions,
    defaultContentMetaBuilderOptions,
} from './shared/meta'

type RecordShape = Record<string, string>

export interface StaticParamBuilderConfig extends ContentMetaGeneratorOptions {
    paramShape: string
}

export type StaticParamBuilderStaticConfig = WalkTreePluginStaticConfig
export type StaticParamBuilderDynamicConfig = WalkTreePluginDynamicConfig &
    Partial<ContentMetaGeneratorOptions> & {
        paramShape: string
    }

export class StaticParamBuilderPlugin extends WalkTreePlugin<
    StaticParamBuilderStaticConfig,
    StaticParamBuilderDynamicConfig
> {
    public defineStaticConfig(): WalkTreePluginStaticConfig {
        return {
            name: 'static-param-builder',
            description: 'Inject static params to the content',
            dynamicConfigSchema: {
                contentMeta: {
                    type: {
                        parser: {
                            type: 'Function',
                            description: 'Parser function for the meta',
                            typeDescription:
                                '(meta: unknown) => Record<string, unknown>',
                            defaultValue:
                                defaultContentMetaBuilderOptions.contentMeta
                                    .parser,
                        },
                        generator: {
                            type: 'Function',
                            description: 'Generator function for the meta',
                            typeDescription:
                                '(meta: unknown) => Record<string, unknown>',
                            defaultValue:
                                defaultContentMetaBuilderOptions.contentMeta
                                    .generator,
                        },
                    },
                    description: 'Content meta parser and generator',
                    optional: true,
                },
                paramShape: {
                    type: 'string',
                    description: 'Define the shape of dynamic param',
                    defaultValue: '/[category]/[...post]',
                },
            },
        }
    }

    private _paramAnalyzer: ParamAnalyzer | undefined
    private get paramAnalyzer() {
        if (!this._paramAnalyzer) {
            this._paramAnalyzer = new ParamAnalyzer(
                this.dynamicConfig.paramAnalyzer
            )
        }
        return this._paramAnalyzer
    }
    private _analyzed: ReturnType<ParamAnalyzer['analyzeParam']> | undefined
    private get analyzed() {
        if (!this._analyzed) {
            this._analyzed = this.paramAnalyzer.analyzeParam(
                this.dynamicConfig.paramShape
            )
        }
        return this._analyzed
    }

    private get meta() {
        return this.$createMetaEngine(
            this.dynamicConfig?.contentMeta ??
                this.defaultDynamicConfig!.contentMeta!
        )
    }

    private splitToPurePath(path: string): Array<string> {
        return path.split('/').filter(Boolean).map(FileReader.getPureFileName)
    }

    private createRecord(keys: string[], value: string): RecordShape {
        return keys.reduce<RecordShape>(
            (acc, key) => ({ ...acc, [key]: value }),
            {}
        )
    }

    public async walk(node: FileTreeNode): Promise<void> {
        if (node.category !== 'TEXT_FILE') return

        const finalBuildPath: string | undefined =
            node.buildInfo?.build_path.build
        if (!finalBuildPath) return

        const paramBuildPath = finalBuildPath.replace(
            this.$buildPath.contents,
            ''
        )
        const buildList: Array<string> = this.splitToPurePath(paramBuildPath)
        const staticParamsContainer: RecordShape = this.createRecord(
            this.analyzed.dynamicParams,
            ''
        )

        const staticParamsInfo = this.analyzed.result.reduce<{
            params: RecordShape
            store: {
                nonDynamic: Array<string>
            }
            listPointer: number
        }>(
            (acc, curr) => {
                if (!curr.isDynamicParam) {
                    acc.store.nonDynamic.push(curr.dividerName)
                    return acc
                }

                const { paramName } = curr

                if (!curr.isMultiple) {
                    const fondedPath = buildList[acc.listPointer]
                    if (!fondedPath) return acc

                    const buildPath: string = [
                        ...acc.store.nonDynamic,
                        fondedPath,
                    ].join('/')

                    acc.listPointer += 1
                    acc.params[paramName] = buildPath
                    acc.store.nonDynamic = []
                    return acc
                }

                const restPath: Array<string> = buildList.slice(acc.listPointer)
                const buildPathList: Array<string> = [
                    ...acc.store.nonDynamic,
                    ...restPath,
                ]
                acc.listPointer += buildPathList.length
                acc.params[paramName] = buildPathList.join('/')
                acc.store.nonDynamic = []
                return acc
            },
            {
                params: staticParamsContainer,
                store: {
                    nonDynamic: [],
                },
                listPointer: 0,
            }
        )

        const href = this.analyzed.result.reduce<string>((acc, curr) => {
            if (!curr.isDynamicParam) {
                return acc
            }

            const { paramName } = curr
            if (!curr.isMultiple) {
                acc += `/${staticParamsInfo.params[paramName]}`
                return acc
            }

            acc += `/${staticParamsInfo.params[paramName]}`
            return acc
        }, '')

        const staticParamUpdate = await this.meta.update({
            injectPath: finalBuildPath,
            meta: {
                href,
                params: staticParamsInfo.params,
            },
        })

        if (staticParamUpdate.success) {
            this.$logger.success(`injected static params to ${finalBuildPath}`)
        }
    }
}
