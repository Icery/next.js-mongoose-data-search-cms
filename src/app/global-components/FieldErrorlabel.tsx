import { ReactElement } from 'react';

import { FieldError } from 'react-hook-form';

interface FieldErrorlabelProps {
  error: FieldError | undefined;
}

const FieldErrorlabel = ({ error }: FieldErrorlabelProps): ReactElement => (
  <>{error && <span className="text-red-500">{error.message}</span>}</>
);

export default FieldErrorlabel;
