<script>
  import { draggable } from '../src';

  export let name;

  let buttonText = 'Button';

  function handleClick() {
    buttonText = 'Button Clicked';
  }
</script>

<h1>Hello {name}!</h1>

<button use:draggable on:click={handleClick}>{buttonText}</button>
