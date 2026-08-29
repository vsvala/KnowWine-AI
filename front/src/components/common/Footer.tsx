const Footer = () => {
  const footerStyle = {
    color: 'rgb(187, 74, 74)',
    backgroundColor: 'rgb(241, 241, 241)',
    fontStyle: 'italic',
    fontSize: 12,
  };
  return (
    <div style={footerStyle}>
      <br />
      <p>
        {' '}
        <em>{new Date().getFullYear()}</em>
      </p>
      <br />
    </div>
  );
};
export default Footer;
