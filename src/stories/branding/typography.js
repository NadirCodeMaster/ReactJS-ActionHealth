import React from "react";
import * as demoContent from "../_support/demoContent";
import * as demoStyles from "../_support/demoStyles";
import styleVars from "style/_vars.scss";

export default {
  title: "Branding/Typography",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Blockquote = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>

    <div style={demoStyles.itemLabelStyle}>Blockquote with P tags inside</div>
    <div style={demoStyles.itemStyle}>
      <blockquote>
        <p>
          Vivamus egestas velit a arcu aliquam a malesuada velit malesuada.Aliquam pellentesque
          turpis quis lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum primis
          in faucibus orci luctus et.
        </p>
        <p>
          Ultrices posuere cubilia curae. Donec justo ligula, hendrerit sed pulvinar ut, pretium ac
          lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae tellus.
          Vestibulum imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit
          aliquam.
        </p>
        <p>
          Donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui.
          Cras vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti
          sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
        </p>
      </blockquote>
    </div>

    <div style={demoStyles.itemLabelStyle}>Blockquote w/out P tags inside</div>
    <div style={demoStyles.itemStyle}>
      <blockquote>
        Vivamus egestas velit a arcu aliquam a malesuada velit malesuada.Aliquam pellentesque turpis
        quis lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum primis in
        faucibus orci luctus et.
      </blockquote>
    </div>
  </React.Fragment>
);

export const HxShort = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>
    <div style={demoStyles.disclaimerBlock}>{headerTypographyDisclaimer}</div>

    <div style={demoStyles.itemLabelStyle}>H1</div>
    <div style={demoStyles.itemStyle}>
      <h1>{demoContent.demoShortSentence}</h1>
    </div>

    <div style={demoStyles.itemLabelStyle}>H2</div>
    <div style={demoStyles.itemStyle}>
      <h2>{demoContent.demoShortSentence}</h2>
    </div>

    <div style={demoStyles.itemLabelStyle}>H3</div>
    <div style={demoStyles.itemStyle}>
      <h3>{demoContent.demoShortSentence}</h3>
    </div>

    <div style={demoStyles.itemLabelStyle}>H4</div>
    <div style={demoStyles.itemStyle}>
      <h4>{demoContent.demoShortSentence}</h4>
    </div>

    <div style={demoStyles.itemLabelStyle}>H5</div>
    <div style={demoStyles.itemStyle}>
      <h5>{demoContent.demoShortSentence}</h5>
    </div>

    <div style={demoStyles.itemLabelStyle}>H6</div>
    <div style={demoStyles.itemStyle}>
      <h6>{demoContent.demoShortSentence}</h6>
    </div>
  </React.Fragment>
);

export const HxLong = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>
    <div style={demoStyles.disclaimerBlock}>{headerTypographyDisclaimer}</div>

    <div style={demoStyles.itemLabelStyle}>H1</div>
    <div style={demoStyles.itemStyle}>
      <h1>{demoContent.demoParagraph}</h1>
    </div>

    <div style={demoStyles.itemLabelStyle}>H2</div>
    <div style={demoStyles.itemStyle}>
      <h2>{demoContent.demoParagraph}</h2>
    </div>

    <div style={demoStyles.itemLabelStyle}>H3</div>
    <div style={demoStyles.itemStyle}>
      <h3>{demoContent.demoParagraph}</h3>
    </div>

    <div style={demoStyles.itemLabelStyle}>H4</div>
    <div style={demoStyles.itemStyle}>
      <h4>{demoContent.demoParagraph}</h4>
    </div>

    <div style={demoStyles.itemLabelStyle}>H5</div>
    <div style={demoStyles.itemStyle}>
      <h5>{demoContent.demoParagraph}</h5>
    </div>

    <div style={demoStyles.itemLabelStyle}>H6</div>
    <div style={demoStyles.itemStyle}>
      <h6>{demoContent.demoParagraph}</h6>
    </div>
  </React.Fragment>
);

export const HxInSitu = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>
    <div style={demoStyles.disclaimerBlock}>{headerTypographyDisclaimer}</div>

    <h1>This is a H1 above some paragraphs</h1>
    <p>
      Vivamus egestas velit a arcu aliquam a malesuada velit malesuada.Aliquam pellentesque turpis
      quis lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum primis in faucibus
      orci luctus et.
    </p>
    <p>
      Ultrices posuere cubilia curae. Donec justo ligula, hendrerit sed pulvinar ut, pretium ac
      lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae tellus. Vestibulum
      imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit aliquam.
    </p>
    <h2>This is a H2 above some paragraphs</h2>
    <p>
      Donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras
      vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad
      litora torquent per conubia nostra, per inceptos himenaeos.
    </p>
    <p>
      Vivamus egestas velit a arcu aliquam a malesuada velit malesuada.Aliquam pellentesque turpis
      quis lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum primis in faucibus
      orci luctus et.
    </p>
    <h3>This is a H3 above some paragraphs</h3>
    <p>
      Ultrices posuere cubilia curae. Donec justo ligula, hendrerit sed pulvinar ut, pretium ac
      lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae tellus. Vestibulum
      imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit aliquam.
    </p>
    <p>
      Donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras
      vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad
      litora torquent per conubia nostra, per inceptos himenaeos.
    </p>
    <h4>This is a H4 above some paragraphs</h4>
    <p>
      Vivamus egestas velit a arcu aliquam a malesuada velit malesuada.Aliquam pellentesque turpis
      quis lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum primis in faucibus
      orci luctus et.
    </p>
    <p>
      Ultrices posuere cubilia curae. Donec justo ligula, hendrerit sed pulvinar ut, pretium ac
      lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae tellus. Vestibulum
      imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit aliquam.
    </p>
    <h5>This is a H5 above some paragraphs</h5>
    <p>
      Donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras
      vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad
      litora torquent per conubia nostra, per inceptos himenaeos.
    </p>
    <p>
      Vivamus egestas velit a arcu aliquam a malesuada velit malesuada.Aliquam pellentesque turpis
      quis lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum primis in faucibus
      orci luctus et.
    </p>
    <h6>This is a H6 above some paragraphs</h6>
    <p>
      Ultrices posuere cubilia curae. Donec justo ligula, hendrerit sed pulvinar ut, pretium ac
      lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae tellus. Vestibulum
      imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit aliquam.
    </p>
    <p>
      Donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras
      vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad
      litora torquent per conubia nostra, per inceptos himenaeos.
    </p>
  </React.Fragment>
);

export const ListsDefinition = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>

    <div style={demoStyles.itemLabelStyle}>Single term and description</div>
    <div style={demoStyles.itemStyle}>
      <dl>
        <dt>Firefox</dt>
        <dd>
          A free, open source, cross-platform, graphical web browser developed by the Mozilla
          Corporation and hundreds of volunteers.
        </dd>
      </dl>
    </div>

    <div style={demoStyles.itemLabelStyle}>Multiple terms, single description</div>
    <div style={demoStyles.itemStyle}>
      <dl>
        <dt>Firefox</dt>
        <dt>Mozilla Firefox</dt>
        <dt>Fx</dt>
        <dd>
          A free, open source, cross-platform, graphical web browser developed by the Mozilla
          Corporation and hundreds of volunteers.
        </dd>
      </dl>
    </div>

    <div style={demoStyles.itemLabelStyle}>Single term, multiple descriptions</div>
    <div style={demoStyles.itemStyle}>
      <dl>
        <dt>Firefox</dt>
        <dd>
          A free, open source, cross-platform, graphical web browser developed by the Mozilla
          Corporation and hundreds of volunteers.
        </dd>
        <dd>
          The Red Panda also known as the Lesser Panda, Wah, Bear Cat or Firefox, is a mostly
          herbivorous mammal, slightly larger than a domestic cat (60 cm long).
        </dd>
      </dl>
    </div>
  </React.Fragment>
);
ListsDefinition.storyName = "Lists - Definition";

export const ListsOrdered = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>

    <ol>
      <li>Donec eu purus justo, convallis molestie turpis.</li>
      <li>Aenean ligula sem.</li>
      <li>
        Vivamus egestas velit a arcu aliquam a malesuada velit malesuada. Aliquam pellentesque
        turpis quis lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum primis in
        faucibus orci luctus et ultrices posuere cubilia curae. Donec justo ligula, hendrerit sed
        pulvinar ut, pretium ac lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque
        vitae tellus. Vestibulum imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie
        blandit aliquam.
      </li>
      <li>Vestibulum ante.</li>
      <li>
        Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae tellus. Vestibulum
        imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit aliquam
        <ol>
          <li>Proin odio libero, semper id gravida id.</li>
          <li>
            Morbi posuere odio a est feugiat interdum. Praesent luctus, lorem sed tincidunt
            lobortis, nunc justo egestas enim.
          </li>
        </ol>
      </li>
    </ol>
  </React.Fragment>
);
ListsOrdered.storyName = "Lists - Ordered";

export const ListsUnordered = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>

    <ul>
      <li>Donec eu purus justo, convallis molestie turpis.</li>
      <li>Aenean ligula sem.</li>
      <li>
        Vivamus egestas velit a arcu aliquam a malesuada velit malesuada. Aliquam pellentesque
        turpis quis lacus hendrerit feugiat tempor risus vulputate. Vestibulum ante ipsum primis in
        faucibus orci luctus et ultrices posuere cubilia curae. Donec justo ligula, hendrerit sed
        pulvinar ut, pretium ac lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque
        vitae tellus. Vestibulum imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie
        blandit aliquam.
      </li>
      <li>Vestibulum ante.</li>
      <li>
        Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae tellus. Vestibulum
        imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit aliquam
        <ul>
          <li>Proin odio libero, semper id gravida id.</li>
          <li>
            Morbi posuere odio a est feugiat interdum. Praesent luctus, lorem sed tincidunt
            lobortis, nunc justo egestas enim.
          </li>
        </ul>
      </li>
    </ul>
  </React.Fragment>
);
ListsUnordered.storyName = "Lists - Unordered";

export const P = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>

    <p>
      Nunc lorem magna, eleifend et semper ac, condimentum in sapien. Nullam egestas mi turpis, quis
      fermentum dui. Aliquam risus lectus, fringilla sit amet laoreet et, ultricies sed nunc.
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse in laoreet mauris. Mauris
      fringilla, odio vel mollis vulputate, enim tellus rutrum velit, sit amet vulputate augue dolor
      a neque. Proin nec fermentum sem. Nulla vestibulum urna non diam volutpat id viverra nisi
      semper. Vivamus nec diam vel turpis laoreet varius at in orci. Proin nibh nisi, volutpat sed
      condimentum id, sagittis scelerisque urna.
    </p>
    <p>
      Donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras
      vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad
      litora torquent per conubia nostra, per inceptos himenaeos.
    </p>
    <p>
      Nunc lorem magna, eleifend et semper ac, condimentum in sapien. Nullam egestas mi turpis, quis
      fermentum dui. Aliquam risus lectus, fringilla sit amet laoreet et, ultricies sed nunc.
      Quisque vel mauris vitae ante molestie imperdiet vel eget eros. Integer feugiat pharetra nibh
      ac congue. Nulla eget urna quis augue dignissim dapibus nec a est. Nullam ac orci mattis
      lectus euismod tempus. Mauris ac fermentum augue. Pellentesque habitant morbi tristique
      senectus et netus et malesuada fames ac turpis egestas.
    </p>
  </React.Fragment>
);

export const Preformatted = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>

    <div style={demoStyles.itemLabelStyle}>pre, w/line breaks in source</div>
    <div style={demoStyles.itemStyle}>
      <pre>
        {`This source text has line breaks throughout
to demonstrate how pre honors whitespace
    including this line with spaces
at the beginning.

More text here eleifend et semper ac,
condimentum in sapien. Nullam egestas
mi turpis, quis fermentum dui. Aliquam
risus lectus, fringilla sit amet laoreet
et, ultricies sed nunc.`}
      </pre>
    </div>

    <div style={demoStyles.itemLabelStyle}>pre, w/out line breaks in source</div>
    <div style={demoStyles.itemStyle}>
      <pre>
        {`This source text has no line breaks in it. Lorem magna, eleifend et semper ac, condimentum in sapien. Nullam egestas mi turpis, quis fermentum dui. Aliquam risus lectus, fringilla sit amet laoreet et, ultricies sed nunc.`}
      </pre>
    </div>

    <div style={demoStyles.itemLabelStyle}>pre, w/inner code tag</div>
    <div style={demoStyles.itemStyle}>
      <pre>
        <code>
          {`/**
 * When the pre tag is used for code samples,
 * a code tag should wrap the stuff inside
 * the pre tag.
 */
function sweetDemo()
{
  return true;
}`}
        </code>
      </pre>
    </div>
  </React.Fragment>
);

export const VariousInline = () => (
  <React.Fragment>
    <div style={demoStyles.disclaimerBlock}>{commonTypographyDisclaimer}</div>
    <div style={demoStyles.itemLabelStyle}>Bold</div>
    <div style={demoStyles.itemStyle}>
      <p>
        Bolded text via <strong>the strong tag</strong> velit a arcu aliquam a malesuada velit
        malesuada.Aliquam pellentesque turpis quis lacus hendrerit feugiat tempor risus vulputate.
        Vestibulum ante ipsum primis in faucibus orci luctus et.
      </p>
    </div>
    <div style={demoStyles.itemLabelStyle}>Code</div>
    <div style={demoStyles.itemStyle}>
      <p>
        Tex styled to be styled as code is wrapped in <code>the code tag</code>. To have a code
        sample that honors the original text whitespace, use the code tag within the pre tag (not
        demonstrated here).
      </p>
    </div>
    <div style={demoStyles.itemLabelStyle}>Italic</div>
    <div style={demoStyles.itemStyle}>
      <p>
        Italicized text via <em>the em tag</em> cubilia. Donec justo ligula, hendrerit sed pulvinar
        ut, pretium ac lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae
        tellus. Vestibulum imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit
        aliquam.
      </p>
    </div>
    <div style={demoStyles.itemLabelStyle}>Links</div>
    <div style={demoStyles.itemStyle}>
      <p>
        Linked text via{" "}
        <a href="https://healthiergeneration.org" target="_blank" rel="noopener noreferrer">
          the a tag
        </a>{" "}
        cubilia. Donec justo ligula, hendrerit sed pulvinar ut, pretium ac lacus. Aenean ligula sem,
        blandit porttitor sodales ut, pellentesque vitae tellus. Vestibulum imperdiet enim euismod
        ipsum iaculis congue. Vestibulum molestie blandit aliquam.
      </p>
    </div>
    <div style={demoStyles.itemLabelStyle}>Small</div>
    <div style={demoStyles.itemStyle}>
      <p>
        Small text via <small>the small tag</small> turpis. Phasellus eget sem leo, ut aliquet dui.
        Cras vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti
        sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
      </p>
    </div>
    <div style={demoStyles.itemLabelStyle}>Super and subscript</div>
    <div style={demoStyles.itemStyle}>
      <p>
        Super and subscript are demonstrated here<sup>sup</sup> and here
        <sub>sub</sub> molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras vitae tortor
        sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora
        torquent per conubia nostra, per inceptos himenaeos.
      </p>
    </div>
  </React.Fragment>
);

// -------------------
// Supporting elements
// -------------------

const commonTypographyDisclaimer = (
  <React.Fragment>
    <p>
      <strong>We use semantic HTML for most markup.</strong> Though we use Material UI for much of
      our front-end code, we generally do not use its Typography component. Instead,{" "}
      <strong>most of our text-related markup is standard semantic HTML</strong>. However, some MUI
      components use Typography internally. To account for that, most CSS style values are declared
      as variables (<code>style/_vars.scss</code>) that are then passed through to our custom style
      declarations <em>and</em> our custom MUI theme overrides.
    </p>
  </React.Fragment>
);

const headerTypographyDisclaimer = (
  <React.Fragment>
    <p>
      <strong>hX tags are not style shortcuts.</strong> As with most semantic HTML, don't use hX
      tags just to achieve styling that resembles one that you like the looks of. Always use the
      appropriate tag based on the page and content hierachy. If something requires the look of a
      given hX tag, but that hX tag is invalid for that situation, use one-off styles applied to
      semantic tag that is correct for that location.
    </p>
    <p>
      The one exception to this is H3, which is generally accepted for stand-alone blocks like
      calls-to-action, which may exist out outside of a standard content hierarchy.
    </p>
    <p>
      Most style values for semantic HTML tags are defined as variables that can be accessed
      throughout P2 via <code>styleVars</code>. For example, the H5 font size for the "large"
      breakpoint is available via <code>styleVars.txtFontSizeH5BpLg</code>. This supports one-off
      styling that allows sustainable mimicking of given semantic style, without invalidating the
      document structure.
    </p>
  </React.Fragment>
);
