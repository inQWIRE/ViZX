// Source: Adrian Lehmann's internal work

import * as vscode from "vscode";
import { assert } from "console";
import { CoqLspAPI } from "./types/coq-lsp";

const YES = "Yes!";
const NO = "Ignore and disable ViZX";
const VSCOQ_EXT_ID = "maximedenes.vscoq";
const VSCOQ_LEGACY_EXT_ID = "coq-community.vscoq1";

export let coqLspApi: CoqLspAPI | undefined = undefined;
export const LSP_EXT_ID = "ejgallego.coq-lsp";

const WORKSPACE_CONFIG_KEY = "vizx";
/**
 * Get ViZX's config
 * @returns The current workspace config for ViZX
 */
export const WORKSPACE_CONFIG = (): vscode.WorkspaceConfiguration =>
  vscode.workspace.getConfiguration(WORKSPACE_CONFIG_KEY);

/**
 * Checks if coq lsp is loaded
 * @param try_load_if_not_found if true will run {@link load_lsp_once} in case lsp was not found
 * @returns true, iff lsp is found
 */
export function check_for_lsp(try_load_if_not_found: boolean = false): boolean {
  if (try_load_if_not_found && !coqLspApi) {
    void load_lsp_once();
  }
  return coqLspApi !== undefined;
}

export function load_lsp_once(): void {
  coqLspApi = vscode.extensions.getExtension<CoqLspAPI>(LSP_EXT_ID)?.exports;
}

/**
 *
 * @returns True, iff user wants to ifnore running vscode
 */
function vscoq_ignored(): boolean {
  return WORKSPACE_CONFIG().get<boolean>(
    IGNORE_ACTIVE_VS_COQ_SETTING_ID,
    false
  );
}

/**
 *
 * @returns Tuple of whether (vscoq, vscoq legacy) are installed & active
 */
function check_no_vscoq(): [boolean, boolean] {
  const vscoq = vscode.extensions.getExtension(VSCOQ_EXT_ID);
  const vscoqlegacy = vscode.extensions.getExtension(VSCOQ_LEGACY_EXT_ID);
  const vscoq_exists: boolean = vscoq ? vscoq.isActive : false;
  const vscoqlegacy_exists: boolean = vscoqlegacy
    ? vscoqlegacy.isActive
    : false;
  return [vscoq_exists, vscoqlegacy_exists];
}

const IGNORE_ACTIVE_VS_COQ_SETTING_ID = "ignoreActiveVsCoq";
/**
 * Prompts the user to disable VSCoq (both current and legacy)
 * @returns True if user wants to continue (i.e., either disabled VSCoq or ignored)
 */
function ask_disable_vscoq(): boolean {
  const ignore = "Ignore and proceed at my own risk";
  let [vscoq_exists, vscoqlegacy_exists] = check_no_vscoq();
  if (vscoq_ignored()) {
    vscode.window.showWarningMessage(
      "Ignoring VSCoq checks. May cause undefined behavior."
    );
    return true;
  }
  if (vscoq_exists || vscoqlegacy_exists) {
    vscode.window
      .showWarningMessage(
        "We found an active VSCoq extension; this should be disabled first to avoid strange behavior due to conflicts with coq-lsp!",
        { modal: true },
        YES,
        NO,
        ignore
      )
      .then((selection) => {
        switch (selection) {
          case YES:
            if (vscoq_exists) {
              vscode.commands.executeCommand(
                "workbench.extensions.disableExtension",
                VSCOQ_EXT_ID
              );
            }
            if (vscoqlegacy_exists) {
              vscode.commands.executeCommand(
                "workbench.extensions.disableExtension",
                VSCOQ_LEGACY_EXT_ID
              );
            }
            return;
          case ignore:
            WORKSPACE_CONFIG().update(IGNORE_ACTIVE_VS_COQ_SETTING_ID, true);
            vscode.window.showWarningMessage(
              "Loading ViZX with VSCoq active. ViZX might exhibit unexpected behavior - please do not file bug reports while running in this mode."
            );
            return;
        }
      });
  }
  if (vscoq_ignored()) {
    return true;
  }
  [vscoq_exists, vscoqlegacy_exists] = check_no_vscoq();
  return !(vscoq_exists || vscoqlegacy_exists);
}

/**
 * Asks user to enable LSP, requires LSP to be installed!
 */
function ask_enable_lsp(): void {
  assert(vscode.extensions.getExtension(LSP_EXT_ID)); // Needs lsp to be installed
  const message =
    `ViZX needs the extension ${LSP_EXT_ID}. It is disabled right now. Would you like to enable it?`;
  vscode.window
    .showErrorMessage(message, { modal: true }, YES, NO)
    .then((selection) => {
      switch (selection) {
        case YES:
          if (ask_disable_vscoq()) {
            // if there's vscoq, we can't install/enable but this fn also prompts user to disable
            return vscode.commands.executeCommand(
              "workbench.extensions.enableExtension",
              LSP_EXT_ID
            );
          } else {
            return vscode.window.showErrorMessage(
              `ViZX failed to run: needs the extension ${LSP_EXT_ID}, which does not safely work with VSCoq`
            );
          }
        case NO:
          return vscode.window.showErrorMessage(
            `ViZX failed to run: needs the extension ${LSP_EXT_ID}.`
          );
      }
    });
}

/**
 * Ask user if they want to install LSP
 */
function ask_install_lsp(): void {
  const yes = "Yes!";
  const show = "Show me!";
  const no = "Ignore and disable ViZX";
  vscode.window
    .showErrorMessage(
      `ViZX needs the extension ${LSP_EXT_ID}. Would you like to install it?`,
      { modal: true },
      yes,
      show,
      no
    )
    .then((selection) => {
      switch (selection) {
        case yes:
          if (ask_disable_vscoq()) {
            // if there's vscoq, we can't install/enable but this fn also prompts user to disable
            return vscode.commands.executeCommand(
              "workbench.extensions.installExtension",
              LSP_EXT_ID
            );
          } else {
            return vscode.window.showErrorMessage(
              `ViZX failed to run: needs the extension ${LSP_EXT_ID}, which does not safely work with VSCoq`
            );
          }
        case no:
          return vscode.window.showErrorMessage(
            `ViZX failed to run: needs the extension ${LSP_EXT_ID}.`
          );
        case show:
          vscode.window.showInformationMessage(
            "Check your sidebar -- The extension will be there!",
            { modal: true }
          );
          return vscode.commands.executeCommand(
            "workbench.extensions.search",
            LSP_EXT_ID
          );
      }
    });
}

/**
 * Guards such that callback only runs if LSP is installed and VSCoq is disabled/ignored. Prompts user to fix install/VSCoq enabling
 * @param callback The callback to execute
 * @returns Callback result
 */
export function only_with_lsp<T>(callback: () => T): T | undefined {
  if (!check_for_lsp(true)) {
    const extension = vscode.extensions.getExtension(LSP_EXT_ID);
    const isInstalledButDisabled = extension && !extension.isActive;
    if (isInstalledButDisabled) {
      ask_enable_lsp();
    } else {
      ask_install_lsp();
    }
    return undefined;
  }
  const [vscoq_exists, vscoqlegacy_exists] = check_no_vscoq();
  if (vscoq_exists || vscoqlegacy_exists) {
    if (!ask_disable_vscoq()) {
      vscode.window.showErrorMessage(
        `ViZX failed to run: needs the extension ${LSP_EXT_ID}, which does not safely work with VSCoq`
      );
      return undefined; // In case user does not ignore the issue and vscoq is active, we fail.
    }
  }
  return callback();
}
