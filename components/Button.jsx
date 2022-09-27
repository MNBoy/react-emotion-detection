import React from 'react';

const Button = ({ onClink, children }) => {
  return (
    <button
      onClick={onClink}
      className='px-6 py-2 text-xl font-light text-white rounded-lg cursor-pointer bg-slate-900'
    >
      {children}
    </button>
  );
};

export default Button;
