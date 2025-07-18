import * as React from "react";

import MainComponent from "./MainComponent";

// export default class ShelterBedApp extends React.Component<
//   IShelterBedAppProps,
//   {}
// > {
//   constructor(prop: IShelterBedAppProps) {
//     super(prop);
//     sp.setup({
//       spfxContext: this.props.context as unknown as undefined,
//     });
//     graph.setup({
//       spfxContext: this.props.context as unknown as undefined,
//     });
//   }
//   public render(): React.ReactElement<IShelterBedAppProps> {
//     return (
//       <div>
//         <MainComponent context={this.props.context} />
//       </div>
//     );
//   }
// }

const ShelterBedApp: any = ({ context }: any) => {
  return <MainComponent context={context} />;
};

export default ShelterBedApp;
