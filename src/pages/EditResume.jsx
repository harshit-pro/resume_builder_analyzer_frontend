

import React from 'react';
import GenerateResume from './GenerateResume';

// Thin wrapper so "/edit-resume/:resumeId" uses the same professional form UI
const EditResume = () => {
  return <GenerateResume />;
};

export default EditResume;
