const getDataWithCache = (url, stateSetter, loadingSetter, cache) => {
  if (cache[url]) {
    stateSetter(cache[url]);
    loadingSetter(false);
  } else {
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        cache[url] = myJson;
        stateSetter(myJson);
        loadingSetter(false);
      });
  }
};

const getData = (url, stateSetter) => {
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      stateSetter(myJson);
    });
};

const getDataWithLoading = (url, stateSetter, loadingSetter) => {
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      stateSetter(myJson);
      loadingSetter(false);
    });
};

export { getDataWithCache, getData, getDataWithLoading };
