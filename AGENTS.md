- 在适用情况下，**始终使用并行工具**。

## 风格指南

### 通用原则

- 除非可组合或可复用，否则将内容保持在一个函数中
- 不要提前提取一次性使用的辅助函数。在调用点内联逻辑，除非该辅助函数需要复用、隐藏真正复杂的边界，或具有清晰独立的名称能够改善调用者的可读性。
- 尽可能避免使用 `try`/`catch`
- 避免使用 `any` 类型
<!-- - 尽可能使用 Bun API，例如 `Bun.file()` -->
- 尽可能依赖类型推断；除非导出或清晰度需要，否则避免显式类型注释或接口
- 优先使用函数式数组方法（flatMap、filter、map）而非 for 循环；在 filter 中使用类型守卫以保持下游的类型推断
- 在 `src/config` 中添加新配置模块时，请遵循文件顶部现有的自导出模式（例如 `export * as ConfigAgent from "./agent"`）。

当一个值只使用一次时，通过内联来减少变量总数。

```ts
// 好的做法
const journal = await Bun.file(path.join(dir, "journal.json")).json()

// 不好的做法
const journalPath = path.join(dir, "journal.json")
const journal = await Bun.file(journalPath).json()
```

### 解构

避免不必要的解构。使用点表示法保持上下文。

```ts
// 好的做法
obj.a
obj.b

// 不好的做法
const { a, b } = obj
```

### 变量

优先使用 `const` 而非 `let`。使用三元表达式或提前返回而非重新赋值。

```ts
// 好的做法
const foo = condition ? 1 : 2

// 不好的做法
let foo
if (condition) foo = 1
else foo = 2
```

### 控制流

避免 `else` 语句。优先使用提前返回。

```ts
// 好的做法
function foo() {
  if (condition) return 1
  return 2
}

// 不好的做法
function foo() {
  if (condition) return 1
  else return 2
}
```

### 复杂逻辑

当一个函数有多个验证分支或支持细节时，让主函数保持正常路径阅读流畅，将支持细节移到下方的小辅助函数中。

```ts
// 好的做法
export function loadThing(input: unknown) {
  const config = requireConfig(input)
  const metadata = readMetadata(input)
  return createThing({ config, metadata })
}

function requireConfig(input: unknown) {
  ...
}
```

- 将辅助函数保持在它们支持的代码附近，如果能提高可读性，放在主要导出下方。
- 不要将简单表达式过度抽象为多个一次性使用的辅助函数；只有在它命名了真正的概念（如 `requireConfig` 或 `readMetadata`）时才提取。
- 除非辅助函数实际执行有副作用的工作，否则不要返回 `Effect`。同步解析、验证和选项构建应该保持同步。
- 在解析不可信的 JSON 字符串时，优先使用 Effect 模式助手（如 `Schema.UnknownFromJsonString` 和 `Schema.decodeUnknownOption`），而不是用 `Effect.try` 包装手动的 `JSON.parse`。
- 只为不明显的约束和令人惊讶的行为添加注释，不要为显而易见的赋值或控制流添加注释。

### 模式定义 (Drizzle)

对字段名使用 snake_case，这样列名就不需要重新定义为字符串。

```ts
// 好的做法
const table = sqliteTable("session", {
  id: text().primaryKey(),
  project_id: text().notNull(),
  created_at: integer().notNull(),
})

// 不好的做法
const table = sqliteTable("session", {
  id: text("id").primaryKey(),
  projectID: text("project_id").notNull(),
  createdAt: integer("created_at").notNull(),
})
```

## 测试

- 尽可能避免使用 mock
- 测试实际实现，不要在测试中重复逻辑
<!-- - 测试不能从仓库根目录运行（保护：`do-not-run-tests-from-root`）；请从包目录（如 `packages/opencode`）运行。 -->

## 类型检查

<!-- - 始终从包目录（例如 `packages/opencode`）运行 `bun typecheck`，永远不要直接运行 `tsc`。 -->

## 文件生成要求

- 目标目录：docs\agent-gen。
- 永远不要在文档中写代码。
- 永远不要在文档中生成例子，除非我又有要求。
