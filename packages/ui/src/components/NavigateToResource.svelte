<script lang="ts">
  import { useMenu } from '@svadmin/core';
  import { navigate } from '@svadmin/core/router';
  
  const { menuItems } = useMenu();

  $effect(() => {
    // Automatically navigate to the first defined resource
    if (menuItems.length > 0) {
      navigate(menuItems[0].route);
    }
  });
</script>

<div class="flex h-screen w-screen items-center justify-center p-4 text-muted-foreground">
  <div class="text-center">
    <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
    <p>Navigating to default resource...</p>
  </div>
</div>
