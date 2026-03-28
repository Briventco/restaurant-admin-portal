import React from 'react';

const SectionCard = ({ title, subtitle, actions, children }) => {
  return (
    <section className="card section-card">
      {(title || actions) ? (
        <div className="section-card-header">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p className="muted-text">{subtitle}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
      ) : null}
      <div className="section-card-body">{children}</div>
    </section>
  );
};

export default SectionCard;