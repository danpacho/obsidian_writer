export const ContentMetaField = {
    required: ['title', 'description'],
    optional: ['update', 'category', 'tags'],
    build: ['params', 'href', 'pagination', 'series', 'seriesInfo'],
} as const

type UndefinableString = string | undefined
export interface DefaultPaginationInfo {
    href: UndefinableString
    title: UndefinableString
    description: UndefinableString
}

export interface DefaultContentMeta {
    title: string
    description: string
    update?: Date
    category?: string
    tags?: Array<string>
    params?: Record<string, string>
    href?: string
    series?: string
    seriesOrder?: number
    seriesInfo?: Array<
        Pick<
            DefaultContentMeta,
            'title' | 'description' | 'href' | 'update' | 'seriesOrder'
        >
    >
    pagination?: {
        prev: DefaultPaginationInfo
        next: DefaultPaginationInfo
    }
}

/**
 * @description Default content collection
 */
export interface ZenContentCollection extends Required<DefaultContentMeta> {}

export const ContentMetaDefaultValueInjector = () => ({
    title: 'DEFAULT TITLE',
    description: 'DEFAULT DESCRIPTION',
    update: new Date(),
})

export interface DefaultCategoryMeta {
    title: string
    description: string
    postCollection: Array<DefaultContentMeta>
}

/**
 * @description Default category collection
 */
export interface ZenCategoryCollection extends Required<DefaultCategoryMeta> {}

export const CategoryMetaField = {
    required: ['title', 'description'],
    build: ['postCollection'],
} as const

export const CategoryMetaDefaultValueInjector = () => ({
    title: 'DEFAULT CATEGORY TITLE',
    description: 'DEFAULT CATEGORY DESCRIPTION',
})
