<template>
	<form ref="formRef" @submit="handleFormSubmit">
		<label>
			<span>项目名称：</span>
			<input required name="name" autocomplete="off" />
		</label>

		<label>
			<span>开始时间：</span>
			<input type="date" required name="begin" value="2017-07-16" />
		</label>

		<label>
			<span>预计结束：</span>
			<input type="date" required name="end" value="2057-07-16" />
		</label>

		<label>
			<span>参与人员：</span>
			<input
				name="person"
				placeholder="多人空格分隔"
				required
				autocomplete="off"
			/>
		</label>

		<label>
			<span>补充说明：</span>
			<textarea rows="5" placeholder="非必填" name="remark"></textarea>
		</label>

		<label>
			<button type="submit">确定创建</button>
			&nbsp;
			<button type="reset">重置</button>
			&nbsp;
			<!--  type 默认即为 submit，因此在 form 中要想执行别的动作就需显式指定 -->
			<button type="button" @click="deleteAll">全部删除</button>
		</label>
	</form>

	<table>
		<thead>
			<tr>
				<th>项目名称</th>
				<th>开始时间</th>
				<th>结束时间</th>
				<th>参与人员</th>
				<th>完成情况</th>
				<th>补充说明</th>
				<th>操作</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="d in data" :key="d.id">
				<td>{{ d.name }}</td>
				<td>{{ d.begin }}</td>
				<td>{{ d.end }}</td>
				<td>{{ d.person }}</td>
				<td>{{ d.done }}</td>
				<td>{{ d.remark }}</td>
				<td>
					<button @click="deleteRow(d.id)">删除</button>
				</td>
			</tr>
		</tbody>
	</table>

	<!-- <div ref="statusRef" class="status">
			<span v-if="result.status === 'error'">数据库打开失败</span>
			<span v-else-if="result.status === 'nodata'">暂无数据</span>
			<span v-else>加载中...</span>
		</div> -->
	<!-- </div> -->
</template>

<script setup>
import { h, onMounted, shallowRef, ref } from "vue";

const [formRef, resultRef, statusRef] = Array.from({ length: 3 }).map(() =>
	ref(null)
);

// 通常从后端获取
const dbInfo = {
	dbName: "test_db",
	version: 4,
	stores: [
		{
			storeName: "project",
			option: {
				keyPath: "id", // 定义主键
				autoIncrement: true, // 自增
			},
			indexes: [
				{ name: "id", keyPath: "id", option: { unique: true } },
				{ name: "name", keyPath: "name" },
				{ name: "begin", keyPath: "begin" },
				{ name: "end", keyPath: "end" },
				{ name: "person", keyPath: "person" },
				{ name: "done", keyPath: "done" },
				{ name: "remark", keyPath: "remark" },
			],
		},
	],
};

let db;
const data = shallowRef([]);

onMounted(async () => {
	db = await openDB(dbInfo);
	data.value = await getDatumByCursor(db, dbInfo.stores[0].storeName);

	// console.log(await getDataByIndex(db, storeName, "name", "山西项目"));
	console.log(data.value);
});

async function handleFormSubmit(event) {
	event.preventDefault();

	const form = formRef.value;
	const datum = Object.fromEntries(Array.from(new FormData(form)));
	await addDatum(db, storeName, datum);
	data.value = await getDatumByCursor(db, storeName);
	form.reset();
}

async function deleteRow(key) {
	await deleteDatumByKey(db, storeName, key);
	data.value = await getDatumByCursor(db, storeName);
}

function deleteAll() {
	console.log("all");
}

function openDB(dbInfo) {
	return new Promise((resolve, reject) => {
		let db;

		const createStores = () => {
			for (const store of dbInfo.stores) {
				const objectStore = db.createObjectStore(store.storeName, store.option);
				for (const index of store.indexes) {
					objectStore.createIndex(index.name, index.keyPath, index.option);
				}
			}
		};

		// 打开数据库，若无则创建
		const request = indexedDB.open(dbInfo.dbName, dbInfo.version);
		request.onsuccess = function (event) {
			db = event.target.result; // 数据库对象
			resolve(db);
		};
		request.onerror = function (event) {
			reject("数据库打开失败");
		};
		// 数据库升级或更新时触发
		request.onupgradeneeded = async function (event) {
			console.log("数据库更新");
			db = event.target.result;
			// 删除原有数据仓库
			dbInfo.stores.forEach((store) => {
				db.deleteObjectStore(store.storeName);
			});
			createStores();
		};
	});
}

function addDatum(db, storeName, datum) {
	return new Promise((resolve, reject) => {
		const request = db
			// 创建事务对象，并指定仓库名称和操作模式（"只读"或"读写"）
			.transaction([storeName], "readwrite")
			.objectStore(storeName)
			.add(datum);

		request.onsuccess = function (event) {
			console.log("数据写入成功");
			resolve();
		};
		request.onerror = function (event) {
			reject("数据写入失败");
		};
	});
}

function getDatumByCursor(db, storeName) {
	return new Promise((resolve, reject) => {
		const list = [];

		const request = db
			.transaction(storeName, "readwrite")
			.objectStore(storeName)
			.openCursor();
		request.onsuccess = function (event) {
			const cursor = event.target.result;
			if (cursor) {
				list.push(cursor.value);
				// 该方法会重新触发一次 store.openCursor()
				// 直到 cursor 为 null，或读取失败
				cursor.continue();
			} else {
				resolve(list);
			}
		};
		request.onerror = function () {
			reject("数据读取失败");
		};
	});
}

function getDatumByIndex(db, storeName, indexName, indexValue) {
	return new Promise((resolve, reject) => {
		const request = db
			.transaction(storeName, "readwrite")
			.objectStore(storeName)
			.index(indexName)
			.get(indexValue);
		request.onsuccess = function (event) {
			const result = event.target.result;
			resolve(result);
		};
		request.onerror = function () {
			reject("查询失败");
		};
	});
}

function getDataByIndex(db, storeName, indexName, indexValue) {
	return new Promise((resolve, reject) => {
		const data = [];
		const request = db
			.transaction(storeName, "readwrite")
			.objectStore(storeName)
			.index(indexName)
			.openCursor(IDBKeyRange.only(indexValue));
		request.onsuccess = function (event) {
			const cursor = event.target.result;
			if (cursor) {
				data.push(cursor.value);
				cursor.continue();
			} else {
				resolve(data);
			}
		};
		request.onerror = function () {
			reject("查询失败");
		};
	});
}

function deleteDatumByKey(db, storeName, key) {
	return new Promise((resolve, reject) => {
		const request = db
			.transaction([storeName], "readwrite")
			.objectStore(storeName)
			.delete(key);
		request.onsuccess = function () {
			resolve();
		};
		request.onerror = function () {
			reject("删除失败");
		};
	});
}

// function deleteStore(dbName) {
// 	return new Promise((resolve, reject) => {
// 		const request = indexedDB.deleteDatabase(dbName);
// 		request.onsuccess = function () {
// 			resolve();
// 		};
// 		request.onerror = function () {
// 			reject("删库失败");
// 		};
// 	});
// }
</script>

<style scoped lang="less">
form {
	label {
		display: block;
		margin-bottom: 10px;
		span {
			vertical-align: top;
		}
	}
}
</style>
