import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { SpelunkerModule } from 'nestjs-spelunker';

const ignoreModules = [
  'BullModule',
  'ConfigModule',
  'ClsModule',
  'AutomapperModule',
  'TypeOrmCoreModule',
  'TypeOrmModule',
  'RedisModule',
  'LoggerModule',
  'AuthorizationModule',
];

export async function generateModuleGraph(app: NestFastifyApplication) {
  // 1. Generate the tree as text
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  const mermaidEdges = edges
    .filter(
      // Filter some extra Modules out
      ({ from, to }) =>
        !(
          ignoreModules.includes(from.module.name) ||
          ignoreModules.includes(to.module.name)
        ),
    )
    .map(({ from, to }) => `${from.module.name}-->${to.module.name}`);
  console.log(`graph TD\n\t${mermaidEdges.join('\n\t')}`);

  // 2. Copy and paste the log content in "https://mermaid.live/"
}
