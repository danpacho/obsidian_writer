import { IO, ShellExecutor } from '@obsidian_blogger/helpers'
import { CorePlugins, PublishSystem } from '../src'

const publish = async () => {
    const io = new IO()
    const shell = new ShellExecutor()

    const BLOG_ROOT =
        '/Users/june/Documents/project/blogger_astro_blog' as const

    const builder = new CorePlugins.BlogBuilder({
        name: 'blog_builder',
        cwd: BLOG_ROOT,
    })

    const github = new CorePlugins.GithubRepository({
        name: 'github_repository',
        cwd: BLOG_ROOT,
        gitPath: (await shell.exec$('which git')).stdout,
    })

    const vercel = new CorePlugins.VercelDeploy({
        name: 'vercel_deploy',
        cwd: BLOG_ROOT,
    })

    const publisher = new PublishSystem({
        name: 'pub_system',
        cwd: BLOG_ROOT,
    })

    publisher.use({
        buildScript: [builder],
        repository: [github],
        deploy: [vercel],
    })

    const uniqueID = new Date().toISOString().replace(/:/g, '_')

    // Assume that file is updated
    await io.writer.write({
        filePath: `${BLOG_ROOT}/ci_test/${new Date()
            .toISOString()
            .replace(/:/g, '_')}.txt`,
        data: `test generated @${uniqueID}`,
    })

    // Publish
    const publishResult = await publisher.publish({
        builder: [
            {
                buildScript: ['build'],
            },
        ],
        repository: [
            {
                branch: 'main',
                commitPrefix: 'feat',
                commitMessage: `published by publisher, automatically generated @${new Date()
                    .toISOString()
                    .replace(/:/g, '_')}`,
            },
        ],
        deployer: [{ someConfig: 'someValue' }],
    })

    // eslint-disable-next-line no-console
    console.log(publishResult)

    await io.writer.write({
        data: JSON.stringify(publishResult, null, 2),
        filePath: `${BLOG_ROOT}/ci_test/${uniqueID}_pub_result.json`,
    })
}

publish()
