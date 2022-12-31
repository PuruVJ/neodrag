import * as t from "@babel/types";
import { resolve as importMetaResolve } from "import-meta-resolve";
import { fileURLToPath } from "url";
async function tagExportsWithRenderer({
  rendererName,
  root
}) {
  const astroServerPath = fileURLToPath(
    await importMetaResolve("astro/server/index.js", root.toString())
  );
  return {
    visitor: {
      Program: {
        enter(path) {
          path.node.body.splice(
            0,
            0,
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier("__astro_tag_component__"),
                  t.identifier("__astro_tag_component__")
                )
              ],
              t.stringLiteral(astroServerPath)
            )
          );
        },
        exit(path, state) {
          const exportedIds = state.get("astro:tags");
          if (exportedIds) {
            for (const id of exportedIds) {
              path.node.body.push(
                t.expressionStatement(
                  t.callExpression(t.identifier("__astro_tag_component__"), [
                    t.identifier(id),
                    t.stringLiteral(rendererName)
                  ])
                )
              );
            }
          }
        }
      },
      ExportDeclaration: {
        enter(path) {
          var _a;
          const node = path.node;
          if (!t.isExportDefaultDeclaration(node))
            return;
          if (t.isArrowFunctionExpression(node.declaration) || t.isCallExpression(node.declaration)) {
            const varName = t.isArrowFunctionExpression(node.declaration) ? "_arrow_function" : "_hoc_function";
            const uidIdentifier = path.scope.generateUidIdentifier(varName);
            path.insertBefore(
              t.variableDeclaration("const", [
                t.variableDeclarator(uidIdentifier, node.declaration)
              ])
            );
            node.declaration = uidIdentifier;
          } else if (t.isFunctionDeclaration(node.declaration) && !((_a = node.declaration.id) == null ? void 0 : _a.name)) {
            const uidIdentifier = path.scope.generateUidIdentifier("_function");
            node.declaration.id = uidIdentifier;
          }
        },
        exit(path, state) {
          var _a, _b, _c;
          const node = path.node;
          if (node.exportKind === "type")
            return;
          if (t.isExportAllDeclaration(node))
            return;
          const addTag = (id) => {
            const tags = state.get("astro:tags") ?? [];
            state.set("astro:tags", [...tags, id]);
          };
          if (t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node)) {
            if (t.isIdentifier(node.declaration)) {
              addTag(node.declaration.name);
            } else if (t.isFunctionDeclaration(node.declaration) && ((_a = node.declaration.id) == null ? void 0 : _a.name)) {
              addTag(node.declaration.id.name);
            } else if (t.isVariableDeclaration(node.declaration)) {
              (_b = node.declaration.declarations) == null ? void 0 : _b.forEach((declaration) => {
                if (t.isArrowFunctionExpression(declaration.init) && t.isIdentifier(declaration.id)) {
                  addTag(declaration.id.name);
                }
              });
            } else if (t.isObjectExpression(node.declaration)) {
              (_c = node.declaration.properties) == null ? void 0 : _c.forEach((property) => {
                if (t.isProperty(property) && t.isIdentifier(property.key)) {
                  addTag(property.key.name);
                }
              });
            } else if (t.isExportNamedDeclaration(node) && !node.source) {
              node.specifiers.forEach((specifier) => {
                if (t.isExportSpecifier(specifier) && t.isIdentifier(specifier.exported)) {
                  addTag(specifier.local.name);
                }
              });
            }
          }
        }
      }
    }
  };
}
export {
  tagExportsWithRenderer as default
};
