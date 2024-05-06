import { IO } from '@blogger/helpers'

export interface DependencyTableConfig {
    /**
     * The root directory where the dependency records are stored.
     */
    recordRoot: string
}

export interface Pkg {
    /**
     * The name of the package.
     */
    name: string
    /**
     * The version of the package.
     */
    version: string
}

/**
 * Represents a key for the package in the DependencyTable storage.
 */
type PkgKey = `__${string}@${string}__`

/**
 * A table that stores package dependencies.
 */
export class DependencyTable {
    private storage: Map<PkgKey, Pkg> = new Map()
    private readonly io: IO = new IO()

    /**
     * Creates a new instance of DependencyTable.
     * @param config The configuration options for the DependencyTable.
     */
    public constructor(public readonly config: DependencyTableConfig) {}

    /**
     * The name of the storage file.
     */
    public static readonly STORAGE_NAME = 'deps.json'

    /**
     * The full path to the storage file.
     */
    public get storagePath(): string {
        return `${this.config.recordRoot}/${DependencyTable.STORAGE_NAME}`
    }

    /**
     * The current status of the DependencyTable.
     */
    public status: 'idle' | 'updated' | 'saved' | 'error' = 'idle'

    /**
     * Loads the package dependencies from the storage file.
     */
    public async load(): Promise<void> {
        const prevStore = await this.io.reader.readFile(this.storagePath)
        if (prevStore.success) {
            this.storage = new Map(JSON.parse(prevStore.data))
        }
    }

    /**
     * Saves the package dependencies to the storage file.
     */
    public async save(): Promise<void> {
        const store = JSON.stringify([...this.storage])
        await this.io.writer.write({
            filePath: this.storagePath,
            data: store,
            handler: {
                onSuccess: () => {
                    // eslint-disable-next-line no-console
                    console.log('DependencyTable › saved')
                    this.status = 'saved'
                },
                onError: (err) => {
                    // eslint-disable-next-line no-console
                    console.error('DependencyTable › save failed', err)
                    this.status = 'error'
                },
            },
        })
    }

    private static hash({ name, version }: Pkg): PkgKey {
        return `__${name}@${version}__`
    }

    /**
     * Sets a package in the DependencyTable.
     * @param pkg The package to set.
     */
    public set(pkg: Pkg): void {
        this.storage.set(DependencyTable.hash(pkg), pkg)
        this.status = 'updated'
    }

    /**
     * Deletes a package from the DependencyTable.
     * @param pkg The package to delete.
     */
    public delete(pkg: Pkg): void {
        this.storage.delete(DependencyTable.hash(pkg))
        this.status = 'updated'
    }

    /**
     * Clears all package dependencies from the DependencyTable.
     */
    public clear() {
        this.storage.clear()
        this.status = 'idle'
    }
}