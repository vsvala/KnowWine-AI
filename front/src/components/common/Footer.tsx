const Footer = () => {
  const footerstylle = {
    color: 'rgb(187, 74, 74)',
    backgroundColor: 'rgb(241, 241, 241)',
    fontStyle: 'italic',
    fontSize: 12,
  };
  return (
    <div style={footerstylle}>
      <br />
      <p>
        {' '}
        <em>KnowWine, 2024</em>
      </p>
      <br />
    </div>
  );
};
export default Footer;
