<template>
  <div>
    <p>User Address: {{ $route.params.userAddress }}</p>
    <p>Repository Name: {{ $route.params.repositoryName }}</p>
  </div>
</template>

<script>
export default {
    name: 'RepoContent',

    data: () => ({}),
};
</script>
