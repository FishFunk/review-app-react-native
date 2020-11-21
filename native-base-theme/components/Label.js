// @flow

import theme from "../../styles/theme";

export default () => {
  const labelTheme = {
    '.focused': {
      width: 0
    },
    fontSize: 17,
    fontFamily: theme.font,
    color: theme.DARK_COLOR
  };

  return labelTheme;
};
