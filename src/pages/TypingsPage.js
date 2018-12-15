// @flow

import * as React from 'react';
import Field from '../components/typings/Field';
import './page.css';
import sampleData from '../data/typings/sample';

function TypingsPage() {
  return (
    <div className="page">
      <Field textBlocksData={sampleData} />
    </div>
  );
}

export default TypingsPage;
