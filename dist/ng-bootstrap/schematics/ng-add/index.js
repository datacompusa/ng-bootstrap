"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const workspace_1 = require("@schematics/angular/utility/workspace");
const messages = require("./messages");
const package_config_1 = require("../utils/package-config");
const NG_BOOTSTRAP_VERSION = '8.0.0';
const BOOTSTRAP_VERSION = '4.5.0';
/**
 * This is executed when `ng add @ng-bootstrap/ng-bootstrap` is run.
 * It installs all dependencies in the 'package.json' and runs 'ng-add-setup-project' schematic.
 */
function ngAdd(options) {
    return (tree, context) => __awaiter(this, void 0, void 0, function* () {
        // Checking that project exists
        const { project } = options;
        if (project) {
            const workspace = yield workspace_1.getWorkspace(tree);
            const projectWorkspace = workspace.projects.get(project);
            if (!projectWorkspace) {
                throw new schematics_1.SchematicsException(messages.noProject(project));
            }
        }
        // Installing dependencies
        const angularCoreVersion = package_config_1.getPackageVersionFromPackageJson(tree, '@angular/core');
        const angularLocalizeVersion = package_config_1.getPackageVersionFromPackageJson(tree, '@angular/localize');
        package_config_1.addPackageToPackageJson(tree, '@ng-bootstrap/ng-bootstrap', `^${NG_BOOTSTRAP_VERSION}`);
        package_config_1.addPackageToPackageJson(tree, 'bootstrap', `^${BOOTSTRAP_VERSION}`);
        if (angularLocalizeVersion === null) {
            package_config_1.addPackageToPackageJson(tree, '@angular/localize', angularCoreVersion);
        }
        context.addTask(new tasks_1.RunSchematicTask('ng-add-setup-project', options), [
            context.addTask(new tasks_1.NodePackageInstallTask()),
        ]);
    });
}
exports.default = ngAdd;
//# sourceMappingURL=index.js.map