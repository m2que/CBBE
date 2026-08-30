import React from 'react';

interface FormattedTextProps {
  text: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^\*\*([^*]+)\*\*$/);
        if (match) {
          return <strong key={`${match[1]}-${index}`}>{match[1]}</strong>;
        }

        return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
      })}
    </>
  );
};

export default FormattedText;
