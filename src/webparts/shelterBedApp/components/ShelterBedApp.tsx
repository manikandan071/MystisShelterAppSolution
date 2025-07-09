import * as React from "react";
// import styles from './ShelterBedApp.module.scss';
import type { IShelterBedAppProps } from "./IShelterBedAppProps";
// import { escape } from '@microsoft/sp-lodash-subset';

import { sp } from "@pnp/sp/presets/all";
import { graph } from "@pnp/graph/presets/all";
import MainComponent from "./MainComponent";

export default class ShelterBedApp extends React.Component<
  IShelterBedAppProps,
  {}
> {
  constructor(prop: IShelterBedAppProps) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
    graph.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }
  public render(): React.ReactElement<IShelterBedAppProps> {
    return (
      <div>
        <MainComponent />
      </div>
    );
  }
}
