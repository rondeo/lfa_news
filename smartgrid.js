const smartgrid = require("smart-grid");

const settings = {
  filename: "_smart-grid",
  outputStyle: "scss" /* less || scss || sass || styl */,
  columns: 12 /* number of grid columns */,
  offset: "2%" /* gutter width px || % || rem */,
  mobileFirst: false /* mobileFirst ? "min-width" : "max-width" */,
  container: {
    maxWidth: "1160px" /* max-width оn very large screen */,
    fields: "30px" /* side fields */
  },
  breakPoints: {
    md: {
      width: "1024px"
    },
    sm: {
      width: "780px",
      fields: "15px" /* set fields only if you want to change container.fields */
    },
    xs: {
      width: "560px"
    }
    /*
    We can create any quantity of break points.

    some_name: {
        width: "Npx",
        fields: "N(px|%|rem)",
        offset: "N(px|%|rem)"
    }
    */
  }
};

smartgrid("src/style/base", settings);
