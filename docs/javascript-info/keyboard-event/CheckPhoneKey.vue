<template>
	<input type="tel" placeholder="请输入手机号码" @keydown="checkPhoneKey" />
</template>

<script setup>
function checkPhoneKey(event) {
	const key = event.key;
	const isNum = key >= "0" && key <= "9";
	const otherValid = [
		"+",
		"(",
		")",
		"-",
		"ArrowLeft",
		"ArrowRight",
		"Delete",
		"Backspace",
	].includes(key);
	if (!isNum && !otherValid) {
		event.preventDefault();
	}
}
</script>
