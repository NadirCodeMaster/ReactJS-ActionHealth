import React from "react";
import ResourceCard from "components/views/ResourceCard";
import { forEach } from "lodash";
import demoDefaultBackgroundImage from "images/fire.svg";
import * as demoContent from "../_support/demoContent";

export default {
  title: "Molecules/Resource Card",
  argTypes: {
    resourceName: {
      description: "Resource title used in the card.",
      control: {
        type: "text",
      },
    },
    resourceSummary: {
      description: "Resource summary used in the card.",
      control: {
        type: "text",
      },
    },
    simulateNoImage: {
      description:
        "This option is only for the styleguide demo. This simulates when a resource has no featured image assigned.",
      control: {
        type: "boolean",
      },
    },
    simulateNoTags: {
      description:
        "This option is only for the styleguide demo. This simulates when a resource has no tags assigned.",
      control: {
        type: "boolean",
      },
    },
    containerWidthPx: {
      description:
        "This option is only for the styleguide demo. ResourceCards fill the space they are given by their container, and this option is provided to explore how they will render with different container sizes.",
      control: {
        type: "range",
        min: 120,
        max: 800,
        step: 1,
      },
    },
  },
};

const defaultContainerWidthPx = 230;

const Story = (args) => {
  const { resourceName, resourceSummary, simulateNoImage, simulateNoTags, containerWidthPx } = args;

  const currentUser = { isAuthenticated: true };

  let resourceTagsMultipleArray = [
    "Nullam",
    "Condimentum in sapien",
    "Quis fermentum",
    "Egestas mi turpis",
    "Aliquam risus lectus",
    "Fringilla",
    "Sit amet",
    "Laoreet et ultricies",
  ];

  let resourceTagsMultiple = [];
  forEach(resourceTagsMultipleArray, (v, k) => {
    resourceTagsMultiple.push({
      id: `resource-tag-${k}`,
      name: v,
      slug: `resource-tag-${k}`,
    });
  });

  let _resourceImage = simulateNoImage ? null : demoDefaultBackgroundImage;
  let _resourceTags = simulateNoTags ? [] : resourceTagsMultiple;

  return (
    <div style={{ width: containerWidthPx + "px" }}>
      <ResourceCard
        currentUser={currentUser}
        handleSearch={() => {
          return true;
        }}
        resourceImage={_resourceImage}
        resourceTags={_resourceTags}
        resourceSummary={resourceSummary}
        resourceLinkUrl={"#"}
        resourceId={1}
        resourceName={resourceName}
      />
    </div>
  );
};

export const Typical = Story.bind({});
Typical.storyName = "Resource Card";
Typical.args = {
  resourceName: demoContent.demoMidSentence,
  resourceSummary: demoContent.demoShortParagraph,
  simulateNoImage: false,
  simulateNoTags: false,
  containerWidthPx: defaultContainerWidthPx,
};
