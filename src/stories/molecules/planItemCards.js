import React from 'react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import PlanItemCard from '../../components/PlanItemCard';
import * as demoContent from '../_support/demoContent';
import { cloneDeep } from 'lodash';

export default {
  title: 'Molecules/Plan Item Card',
  argTypes: {
    containerWidthPx: {
      description:
        'This option is only for the styleguide demo. PlanItemCards fill the space they are given by their container, and this option is provided to explore how they will render with different container sizes.',
      control: {
        type: 'range',
        min: 120,
        max: 800,
        step: 1
      }
    }
  }
};

const defaultContainerWidthPx = 304;

export const SingleCriterionInstance = args => {
  const { containerWidthPx } = args;
  return (
    <Router history={history}>
      <div style={{ width: containerWidthPx + 'px' }}>
        <PlanItemCard
          userCanViewActionPlan={true}
          userCanEditActionPlan={true}
          userCanViewAssessment={true}
          planItem={planItem}
          orgSetsData={orgSetsDataSingle}
          organizationId={1}
          planItemIndex={0}
          responseTextForCriterion={responseTextForCriterion}
          closeItem={testFunction}
          deleteItem={testFunction}
          reopenItem={testFunction}
        />
      </div>
    </Router>
  );
};
SingleCriterionInstance.args = {
  containerWidthPx: defaultContainerWidthPx
};

export const MultipleCriterionInstances = args => {
  const { containerWidthPx } = args;
  return (
    <Router history={history}>
      <div style={{ width: containerWidthPx + 'px' }}>
        <PlanItemCard
          userCanViewActionPlan={true}
          userCanEditActionPlan={true}
          userCanViewAssessment={true}
          planItem={planItem}
          orgSetsData={orgSetsDataMultiple}
          organizationId={1}
          planItemIndex={0}
          responseTextForCriterion={responseTextForCriterion}
          closeItem={testFunction}
          deleteItem={testFunction}
          reopenItem={testFunction}
        />
      </div>
    </Router>
  );
};
MultipleCriterionInstances.args = {
  containerWidthPx: defaultContainerWidthPx
};

export const LongTitle = args => {
  const { containerWidthPx } = args;
  return (
    <Router history={history}>
      <div style={{ width: containerWidthPx + 'px' }}>
        <PlanItemCard
          userCanViewActionPlan={true}
          userCanEditActionPlan={true}
          userCanViewAssessment={true}
          planItem={planItem}
          orgSetsData={orgSetsDataSingle}
          organizationId={1}
          planItemIndex={0}
          responseTextForCriterion={responseTextForCriterion}
          closeItem={testFunction}
          deleteItem={testFunction}
          reopenItem={testFunction}
        />
      </div>
    </Router>
  );
};
LongTitle.args = {
  containerWidthPx: defaultContainerWidthPx
};

export const Complete = args => {
  const { containerWidthPx } = args;

  let planItemCompleted = cloneDeep(planItem);
  planItemCompleted.date_completed = '10-10-20';

  return (
    <Router history={history}>
      <div style={{ width: containerWidthPx + 'px' }}>
        <PlanItemCard
          userCanViewActionPlan={true}
          userCanEditActionPlan={true}
          userCanViewAssessment={true}
          planItem={planItemCompleted}
          orgSetsData={orgSetsDataSingle}
          organizationId={1}
          planItemIndex={0}
          responseTextForCriterion={responseTextForCriterion}
          closeItem={testFunction}
          deleteItem={testFunction}
          reopenItem={testFunction}
        />
      </div>
    </Router>
  );
};
Complete.args = {
  containerWidthPx: defaultContainerWidthPx
};

const history = createMemoryHistory();
const planItem = {
  id: 1,
  plan_id: 1,
  criterion_id: 1,
  description: demoContent.demoSentence
};

const testFunction = () => {
  return true;
};

const responseTextForCriterion = () => {
  return 'Fully in Place';
};
const orgSetsDataSingle = [
  {
    id: 1,
    abbreviation: 'Abbrev 1',
    program_id: 1000,
    criterion_instances: [
      {
        id: 1,
        criterion_id: 1,
        handle: '12.34',
        set_id: 1,
        criterion: {
          id: 1,
          name: 'Test Criterion Name Placeholder'
        }
      }
    ]
  }
];
const orgSetsDataMultiple = [
  {
    id: 1,
    abbreviation: 'Abbrev 1',
    program_id: 1000,
    criterion_instances: [
      {
        id: 1,
        criterion_id: 1,
        handle: '12.34',
        set_id: 1,
        criterion: {
          id: 1
        }
      }
    ]
  },
  {
    id: 2,
    abbreviation: 'Test Abbrev',
    program_id: 1000,
    criterion_instances: [
      {
        id: 2,
        criterion_id: 1,
        handle: '43.21',
        set_id: 2,
        criterion: {
          id: 1,
          name: 'Test Criterion Name Placeholder'
        }
      }
    ]
  }
];
const orgSetsDataSingleLongTitle = cloneDeep(orgSetsDataSingle);
orgSetsDataSingleLongTitle[0].criterion_instances[0].criterion.name =
  demoContent.demoParagraph;
