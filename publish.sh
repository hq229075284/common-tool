#! /bin/bash

PREV_VERSION='';
re="\"(version)\": \"([^\"]*)\"";
while read -r l; do
    if [[ $l =~ $re ]]; then
        value="${BASH_REMATCH[2]}";
        PREV_VERSION="$value";
    fi
done < package.json;

echo '当前版本'
echo $PREV_VERSION;

echo '请输入下一个版本号'
read VERSION

if [[ $VERSION == '' ]]; then
    VERSION=$PREV_VERSION
fi

npm run build

cp package.json package_template.json
sed "s/\"version\": \"${PREV_VERSION}\"/\"version\": \"${VERSION}\"/" package_template.json > package.json
rm -f package_template.json

npm publish --dry-run

echo 是否确认发布?
read CONFIRM

if [[ $CONFIRM == 'Y' ]];then
    npm publish
    git add package.json
    git commit -m "publish v${VERSION}"
    git tag "v${VERSION}"
fi

