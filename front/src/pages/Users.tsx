  // useEffect: runs after the first render to perform side-effects.
  // Here it fetches the items from the backend API and sets state.
  // Runs once because the dependency array is empty (`[]`).
//TODO move to hooks 
  // useEffect(() => {
  //   console.log('useeffect get all users');
  //   userService
  //     .getAll()
  //     .then((initialUsers) => {
  //       setUser(initialUsers);
  //     })
  //     .catch(() => {
  //       console.error('Error loading users');
  //       setNotification({ text: 'Unable to load users', type: 'error' });
  //     });
  // }, []);
  // // console.log('render', items.length, 'items')

