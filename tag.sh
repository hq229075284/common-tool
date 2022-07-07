tagList=$(git tag -l)

for tag in $tagList
do
    git push origin $tag
done