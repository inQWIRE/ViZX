import {
  VersionedTextDocumentIdentifier,
  Position,
  Range,
} from "vscode-languageserver-types";
import { Disposable } from "vscode";
export interface Hyp<Pp> {
  names: Pp[];
  def?: Pp;
  ty: Pp;
}
export interface Goal<Pp> {
  ty: Pp;
  hyps: Hyp<Pp>[];
}
export interface GoalConfig<Pp> {
  goals: Goal<Pp>[];
  stack: [Goal<Pp>[], Goal<Pp>[]][];
  bullet?: Pp;
  shelf: Goal<Pp>[];
  given_up: Goal<Pp>[];
}
export interface Message<Pp> {
  range?: Range;
  level: number;
  text: Pp;
}
export type Id = ["Id", string];
export interface Loc {
  fname: any;
  line_nb: number;
  bol_pos: number;
  line_nb_last: number;
  bol_pos_last: number;
  bp: number;
  ep: number;
}
export interface Obl {
  name: Id;
  loc?: Loc;
  status: [boolean, any];
  solved: boolean;
}
export interface OblsView {
  opaque: boolean;
  remaining: number;
  obligations: Obl[];
}
export type ProgramInfo = [Id, OblsView][];
export interface GoalAnswer<Pp> {
  textDocument: VersionedTextDocumentIdentifier;
  position: Position;
  goals?: GoalConfig<Pp>;
  program?: ProgramInfo;
  messages: Message<Pp>[]; // Removed Pp[] as this is depecrecated https://coq.zulipchat.com/#narrow/channel/329642-coq-lsp/topic/Get.20current.20goal.2Fhypothesis.20state.20without.20notation/near/479625636
  error?: Pp;
}


export interface CoqLspAPI {

  /**
   * Register callback on user-initiated goals request
   */
  onUserGoals(fn: (goals: GoalAnswer<string>) => void): Disposable;
}
