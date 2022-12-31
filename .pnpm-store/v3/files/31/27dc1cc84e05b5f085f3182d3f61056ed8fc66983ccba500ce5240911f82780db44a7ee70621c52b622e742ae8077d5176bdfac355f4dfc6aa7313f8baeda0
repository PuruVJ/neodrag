"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repair = void 0;
const tslib_1 = require("tslib");
const params_1 = require("../utils/params");
const migrationsJson = require("../../migrations.json");
const migrate_1 = require("./migrate");
const output_1 = require("../utils/output");
function repair(args, extraMigrations = []) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (args['verbose']) {
            process.env.NX_VERBOSE_LOGGING = 'true';
        }
        const verbose = process.env.NX_VERBOSE_LOGGING === 'true';
        return (0, params_1.handleErrors)(verbose, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const nxMigrations = Object.entries(migrationsJson.generators).map(([name, migration]) => {
                return {
                    package: 'nx',
                    cli: 'nx',
                    name,
                    description: migration.description,
                    version: migration.version,
                };
            });
            const migrations = [...nxMigrations, ...extraMigrations];
            const migrationsThatMadeNoChanges = yield (0, migrate_1.executeMigrations)(process.cwd(), migrations, verbose, false, '');
            if (migrationsThatMadeNoChanges.length < migrations.length) {
                output_1.output.success({
                    title: `Successfully repaired your configuration. This workspace is up to date!`,
                });
            }
            else {
                output_1.output.success({
                    title: `No changes were necessary. This workspace is up to date!`,
                });
            }
        }));
    });
}
exports.repair = repair;
//# sourceMappingURL=repair.js.map